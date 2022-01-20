import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StatusCodes } from 'http-status-codes';
import { BehaviorSubject, EMPTY, Observable, TimeoutError, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Asset, AssetConsumption } from '../types/Asset';
import { BillingInvoice, BillingPaymentMethod, BillingTax } from '../types/Billing';
import { Car, CarCatalog, CarMaker, ImageObject } from '../types/Car';
import { ChargingProfile, GetCompositeScheduleCommandResult } from '../types/ChargingProfile';
import { ChargePoint, ChargingStation, OCPPAvailabilityType, OcppParameter } from '../types/ChargingStation';
import { Company } from '../types/Company';
import CentralSystemServerConfiguration from '../types/configuration/CentralSystemServerConfiguration';
import { IntegrationConnection, UserConnection } from '../types/Connection';
import { ActionResponse, ActionsResponse, AssetDataResult, BillingOperationResult, CarCatalogDataResult, CarDataResult, CheckAssetConnectionResponse, CheckBillingConnectionResponse, CompanyDataResult, DataResult, LogDataResult, LoginResponse, OCPIGenerateLocalTokenResponse, OCPIJobStatusesResponse, OCPIPingResponse, OICPJobStatusesResponse, OICPPingResponse, Ordering, Paging, PricingDefinitionDataResult, RegistrationTokenDataResult, SiteAreaDataResult, SiteDataResult, TagDataResult, UserDataResult } from '../types/DataResult';
import { EndUserLicenseAgreement } from '../types/Eula';
import { FilterParams, Image, KeyValue } from '../types/GlobalType';
import { AssetInError, ChargingStationInError, TransactionInError } from '../types/InError';
import { Log } from '../types/Log';
import { OcpiEndpoint } from '../types/ocpi/OCPIEndpoint';
import { OCPPResetType } from '../types/ocpp/OCPP';
import { OicpEndpoint } from '../types/oicp/OICPEndpoint';
import PricingDefinition from '../types/Pricing';
import { RefundReport } from '../types/Refund';
import { RegistrationToken } from '../types/RegistrationToken';
import { ServerAction, ServerRoute } from '../types/Server';
import { BillingSettings, SettingDB } from '../types/Setting';
import { Site, SiteUser } from '../types/Site';
import { SiteArea, SiteAreaConsumption } from '../types/SiteArea';
import { StatisticData } from '../types/Statistic';
import { Tag } from '../types/Tag';
import { Tenant } from '../types/Tenant';
import { OcpiData, Transaction } from '../types/Transaction';
import { User, UserDefaultTagCar, UserSite, UserToken } from '../types/User';
import { Constants } from '../utils/Constants';
import { Utils } from '../utils/Utils';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { WindowService } from './window.service';

@Injectable()
export class CentralServerService {
  private centralRestServerServiceBaseURL!: string;
  private centralRestServerServiceSecuredURL!: string;
  private centralRestServerServiceUtilURL!: string;
  private restServerAuthURL!: string;
  private restServerSecuredURL!: string;
  private restServerServiceUtilURL!: string;
  private centralSystemServerConfig: CentralSystemServerConfiguration;
  private initialized = false;
  private currentUserToken!: string;
  private currentUser!: UserToken;
  private currentUserSubject = new BehaviorSubject<UserToken>(this.currentUser);

  public constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private windowService: WindowService,
    private dialog: MatDialog,
    public configService: ConfigService) {
    // Default
    this.initialized = false;
  }

  public getCentralRestServerServiceUtilURL(): string {
    return this.centralRestServerServiceUtilURL;
  }

  public getCentralRestServerServiceSecuredURL(): string {
    return this.centralRestServerServiceSecuredURL;
  }

  public getRestServerAuthURL(): string {
    return this.restServerAuthURL;
  }

  public removeChargersFromSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA_REMOVE_CHARGING_STATIONS, { id: siteAreaID }),
      { chargingStationIDs: chargerIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteTransactions(transactionsIDs: number[]): Observable<ActionsResponse> {
    // Verify init
    this.checkInit();
    const options = {
      headers: this.buildHttpHeaders(),
      body: { transactionsIDs },
    };
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS), options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addChargersToSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA_ASSIGN_CHARGING_STATIONS, { id: siteAreaID }),
      { chargingStationIDs: chargerIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addAssetsToSiteArea(siteAreaID: string, assetIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA_ASSIGN_ASSETS, { id: siteAreaID }),
      { assetIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public removeAssetsFromSiteArea(siteAreaID: string, assetIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA_REMOVE_ASSETS, { id: siteAreaID }),
      { assetIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public removeUsersFromSite(siteID: string, userIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_REMOVE_USERS, { id: siteID }),
      { userIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addUsersToSite(siteID: string, userIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_ADD_USERS, { id: siteID }),
      { userIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSiteUserAdmin(siteID: string, userID: string, siteAdmin: boolean): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_ADMIN, { id: siteID }),
      { userID, siteAdmin },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSiteOwner(siteID: string, userID: string, siteOwner: boolean): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_OWNER, { id: siteID }),
      { userID, siteOwner },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public removeSitesFromUser(userID: string, siteIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER_SITES, { id: userID });
    return this.httpClient.put<ActionResponse>(url,
      { siteIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addSitesToUser(userID: string, siteIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER_SITES, { id: userID });
    return this.httpClient.post<ActionResponse>(url,
      { siteIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanies(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<CompanyDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<CompanyDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_COMPANIES),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompany(companyId: string, withLogo: boolean = false): Observable<Company> {
    const params: { [param: string]: string } = {};
    params['WithLogo'] = withLogo.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Company>(this.buildRestEndpointUrl(ServerRoute.REST_COMPANY, { id: companyId }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanyLogo(companyID: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(this.buildUtilRestEndpointUrl(ServerRoute.REST_COMPANY_LOGO, { id: companyID }),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getAssets(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<AssetDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<AssetDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_ASSETS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getAsset(assetId: string, withImage: boolean = false, withSiteArea: boolean = false): Observable<Asset> {
    const params: { [param: string]: string } = {};
    params['WithImage'] = withImage.toString();
    params['WithSiteArea'] = withSiteArea.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Asset>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET, { id: assetId }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getAssetImage(assetID: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(this.buildUtilRestEndpointUrl(ServerRoute.REST_ASSET_IMAGE, { id: assetID }),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getAssetsInError(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<AssetInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<AssetInError>>(this.buildRestEndpointUrl(ServerRoute.REST_ASSETS_IN_ERROR),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserSites(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteUser>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteUser>>(this.buildRestEndpointUrl(ServerRoute.REST_USER_SITES, { id: params.UserID.toString() }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSites(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<SiteDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<SiteDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_SITES),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingProfiles(params: FilterParams, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingProfile>> {
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    return this.httpClient.get<DataResult<ChargingProfile>>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_PROFILES}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public triggerSmartCharging(siteAreaID: string): Observable<ActionResponse> {
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['SiteAreaID'] = siteAreaID;
    return this.httpClient.get<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATION_TRIGGER_SMART_CHARGING}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSite(siteID: string, withImage: boolean = false, withCompany: boolean = false): Observable<Site> {
    const params: { [param: string]: string } = {};
    params['WithImage'] = withImage.toString();
    params['WithCompany'] = withCompany.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Site>(this.buildRestEndpointUrl(ServerRoute.REST_SITE, { id: siteID }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteImage(siteID: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(this.buildUtilRestEndpointUrl(ServerRoute.REST_SITE_IMAGE, { id: siteID }),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreas(params: FilterParams = {},
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<SiteAreaDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<SiteAreaDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREAS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteArea(siteAreaID: string, withSite?: boolean): Observable<SiteArea> {
    const params: { [param: string]: string } = {};
    if (withSite) {
      params['WithSite'] = withSite.toString();
    }
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteArea>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA, { id: siteAreaID }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreaImage(siteAreaID: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(this.buildUtilRestEndpointUrl(ServerRoute.REST_SITE_AREA_IMAGE, { id: siteAreaID }),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getTransactionYears(): Observable<number[]> {
    const params: { [param: string]: string } = {};
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<number[]>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION_YEARS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationConsumptionStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_CHARGING_STATION_CONSUMPTION_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserConsumptionStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_USER_CONSUMPTION_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationUsageStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_CHARGING_STATION_USAGE_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserUsageStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_USER_USAGE_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationInactivityStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_CHARGING_STATION_INACTIVITY_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserInactivityStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_USER_INACTIVITY_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLastTransaction(chargingStationID: string, connectorID: number): Observable<DataResult<Transaction>> {
    const params: { [param: string]: string } = {};
    params['ConnectorID'] = connectorID.toString();
    params['Limit'] = '1';
    params['Skip'] = '0';
    params['WithTag'] = 'true';
    params['SortFields'] = '-timestamp';
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/transactions`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationTransactionsStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_CHARGING_STATION_TRANSACTIONS_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserTransactionsStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_USER_TRANSACTIONS_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationPricingStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_CHARGING_STATION_PRICING_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserPricingStatistics(year: number,
    params: FilterParams = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(this.buildRestEndpointUrl(ServerRoute.REST_USER_PRICING_STATISTICS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStations(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingStation>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargingStation>>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  public getChargingStation(id: string): Observable<ChargingStation> {
    const params: { [param: string]: string } = {};
    params['WithSite'] = 'true';
    params['WithSiteArea'] = 'true';
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<ChargingStation>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${id}`,
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getConnectorQrCode(chargingStationID: string, connectorID: number): Observable<Image> {
    // Verify init
    this.checkInit();
    if (!chargingStationID || connectorID < 0) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Image>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/connectors/${connectorID}/qrcode/generate`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // eslint-disable-next-line max-len
  public getChargingStationsInError(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingStationInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargingStationInError>>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_IN_ERROR}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteUsers(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<UserSite>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<UserSite>>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_USERS, { id: params.SiteID as string }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUsers(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<UserDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<UserDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_USERS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTag(tagID: string): Observable<Tag> {
    // Verify init
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['WithUser'] = 'true';
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_TAG, { id: tagID });
    return this.httpClient.get<Tag>(url,
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTagByVisualID(tagVisualID: string): Observable<Tag> {
    // Verify init
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['VisualID'] = tagVisualID;
    params['WithUser'] = 'true';
    // Execute the REST service
    return this.httpClient.get<Tag>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserDefaultTagCar(userID: string): Observable<UserDefaultTagCar> {
    // Verify init
    this.checkInit();
    return this.httpClient.get<UserDefaultTagCar>(this.buildRestEndpointUrl(ServerRoute.REST_USER_DEFAULT_TAG_CAR),
      {
        headers: this.buildHttpHeaders(),
        params: {
          UserID: userID
        }
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTags(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<TagDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<TagDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteTag(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_TAG, { id });
    return this.httpClient.delete<ActionResponse>(url,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteTags(tagsIDs: string[]): Observable<ActionsResponse> {
    // Verify init
    this.checkInit();
    const options = {
      headers: this.buildHttpHeaders(),
      body: { tagsIDs },
    };
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS), options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public unassignTags(visualIDs: string[]): Observable<ActionsResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS_UNASSIGN), { visualIDs }, {
      headers: this.buildHttpHeaders()
    })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public unassignTag(visualID: string): Observable<ActionsResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAG_UNASSIGN, { id: visualID }), {}, {
      headers: this.buildHttpHeaders()
    })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createTag(tag: Tag): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS), tag,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateTag(tag: Tag): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_TAG, { id: tag.visualID });
    return this.httpClient.put<ActionResponse>(url, tag,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public assignTag(tag: Partial<Tag>): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAG_ASSIGN, { id: tag.visualID }), tag,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateTagByVisualID(tag: Partial<Tag>): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TAGS), tag,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUsersInError(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(this.buildRestEndpointUrl(ServerRoute.REST_USERS_IN_ERROR),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTenants(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Tenant>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Tenant>>(this.buildRestEndpointUrl(ServerRoute.REST_TENANTS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTenant(id: string): Observable<Tenant> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Tenant>(this.buildRestEndpointUrl(ServerRoute.REST_TENANT, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTenantLogo(tenantID: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['ID'] = tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(
      this.buildUtilRestEndpointUrl(ServerRoute.REST_TENANT_LOGO),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getTenantLogoBySubdomain(tenantSubDomain: string): Observable<string> {
    const params: { [param: string]: string } = {};
    params['Subdomain'] = tenantSubDomain;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(
      this.buildUtilRestEndpointUrl(ServerRoute.REST_TENANT_LOGO),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => this.processImage(blob)),
        catchError(this.handleHttpError),
      );
  }

  public getTransactions(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_COMPLETED),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionsToRefund(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_REFUND),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getRefundReports(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<RefundReport>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<RefundReport>>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_REFUND_REPORTS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTransactionOcpiCdr(id: number): Observable<OcpiData> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<OcpiData>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION_CDR_EXPORT, { id }),
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransaction(id: number): Observable<Transaction> {
    const params: { [param: string]: string } = {};
    params['WithUser'] = 'true';
    params['WithTag'] = 'true';
    params['WithCar'] = 'true';
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Transaction>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION, { id }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportLogs(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_LOGGINGS_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportUsers(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_USERS_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTransactions(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTransactionsToRefund(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_REFUND_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportStatistics(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_STATISTICS_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportChargingStations(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_EXPORT}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportAllChargingStationsOCPPParams(params: FilterParams): Observable<Blob> {
    this.getPaging(Constants.DEFAULT_PAGING, params);
    // Verify init
    this.checkInit();
    return this.httpClient.get(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_EXPORT_OCPP_PARAMETERS}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTags(params: FilterParams): Observable<Blob> {
    // Verify init
    this.checkInit();
    return this.httpClient.get(this.buildRestEndpointUrl(ServerRoute.REST_TAGS_EXPORT),
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionsInError(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<TransactionInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<TransactionInError>>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_IN_ERROR),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getActiveTransactions(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_ACTIVE),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // eslint-disable-next-line max-len
  public getOcpiEndpoints(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<OcpiEndpoint>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<OcpiEndpoint>>(this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINTS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // eslint-disable-next-line max-len
  public getOicpEndpoints(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<OicpEndpoint>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<OicpEndpoint>>(this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINTS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreaConsumption(siteAreaID: string, startDate: Date, endDate: Date): Observable<SiteAreaConsumption> {
    const params: { [param: string]: string } = {};
    params['StartDate'] = startDate.toISOString();
    params['EndDate'] = endDate.toISOString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteAreaConsumption>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA_CONSUMPTION, { id: siteAreaID }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getAssetConsumption(assetID: string, startDate: Date, endDate: Date): Observable<AssetConsumption> {
    const params: { [param: string]: string } = {};
    params['StartDate'] = startDate.toISOString();
    params['EndDate'] = endDate.toISOString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<AssetConsumption>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET_CONSUMPTIONS, { id: assetID }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionConsumption(transactionId: number, loadAllConsumptions?: boolean, ordering: Ordering[] = []): Observable<Transaction> {
    const params: { [param: string]: string } = {};
    if (loadAllConsumptions) {
      params['LoadAllConsumptions'] = loadAllConsumptions.toString();
    }
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Transaction>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION_CONSUMPTIONS, { id: transactionId }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createTenant(tenant: Tenant): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TENANTS), tenant,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateTenant(tenant: Tenant): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TENANT, { id: tenant.id }), tenant,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteTenant(id: string): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TENANT, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLogs(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<LogDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<LogDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_LOGGINGS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLog(id: string): Observable<Log> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Call
    return this.httpClient.get<Log>(this.buildRestEndpointUrl(ServerRoute.REST_LOGGING, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserImage(id: string): Observable<Image> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    if (!id) {
      return EMPTY;
    }
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER_IMAGE, { id });
    return this.httpClient.get<Image>(url,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUser(id: string): Observable<User> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER, { id });
    return this.httpClient.get<User>(url,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getInvoice(invoiceID: string): Observable<Blob> {
    // Verify init
    this.checkInit();
    if (!invoiceID) {
      return EMPTY;
    }
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_INVOICE, {
      invoiceID
    });
    // Execute the REST service
    return this.httpClient.get(url,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSetting(identifier: string): Observable<SettingDB> {
    // verify init
    this.checkInit();
    // Execute the REST Service
    return this.httpClient.get<SettingDB>(this.buildRestEndpointUrl(ServerRoute.REST_SETTINGS),
      {
        headers: this.buildHttpHeaders(),
        params: {
          Identifier: identifier
        }
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getBillingSettings(): Observable<BillingSettings> {
    // verify init
    this.checkInit();
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_SETTING);
    // Execute the REST Service
    return this.httpClient.get<BillingSettings>(url, {
      headers: this.buildHttpHeaders()
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public updateBillingSettings(billingSettings: BillingSettings): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_SETTING);
    // Execute
    return this.httpClient.put<ActionResponse>(url, billingSettings, {
      headers: this.buildHttpHeaders(),
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public clearBillingTestData(): Observable<BillingOperationResult> {
    // Verify init
    this.checkInit();
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_CLEAR_TEST_DATA);
    // Execute
    return this.httpClient.post<BillingOperationResult>(url, {}, {
      headers: this.buildHttpHeaders(),
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public checkBillingConnection(): Observable<CheckBillingConnectionResponse> {
    // verify init
    this.checkInit();
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_CHECK);
    // Execute the REST Service
    return this.httpClient.post<CheckBillingConnectionResponse>(url, {}, {
      headers: this.buildHttpHeaders()
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public synchronizeUsersForBilling(): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionsResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_SYNCHRONIZE_USERS}`, {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public synchronizeUserForBilling(userID: string): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_SYNCHRONIZE_USER}`, { id: userID },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // TODO - create a dedicated method for the ATTACH?
  public setupPaymentMethod(parameters: any): Observable<BillingOperationResult> {
    this.checkInit();
    // Build the URL
    const urlPattern: ServerRoute = (!parameters.paymentMethodID) ? ServerRoute.REST_BILLING_PAYMENT_METHOD_SETUP : ServerRoute.REST_BILLING_PAYMENT_METHOD_ATTACH;
    const url = this.buildRestEndpointUrl(urlPattern, {
      userID: parameters.userID,
      paymentMethodID: parameters.paymentMethodID
    });
    // Execute the REST service
    return this.httpClient.post<BillingOperationResult>(url, parameters, {
      headers: this.buildHttpHeaders(),
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public getPaymentMethods(currentUserID: string, params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<BillingPaymentMethod>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_PAYMENT_METHODS, {
      userID: currentUserID
    });
    // Execute the REST Service
    return this.httpClient.get<DataResult<BillingPaymentMethod>>(url, {
      headers: this.buildHttpHeaders(),
      params
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public deletePaymentMethod(paymentMethodID: string, userID: string): Observable<BillingOperationResult> {
    // Verify init
    this.checkInit();
    const options = {
      headers: this.buildHttpHeaders(),
      // body: { paymentMethodId: paymentMethodID, userID },
    };
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_PAYMENT_METHOD, {
      userID,
      paymentMethodID
    });
    // Execute the REST service
    return this.httpClient.delete<BillingOperationResult>(url, options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public forceSynchronizeUserForBilling(userID: string): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_FORCE_SYNCHRONIZE_USER}`,
      { id: userID },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getBillingTaxes(): Observable<BillingTax[]> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<BillingTax[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_TAXES}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getInvoices(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<BillingInvoice>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Build the URL
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_INVOICES);
    // Execute the REST Service
    return this.httpClient.get<DataResult<BillingInvoice>>(url, {
      headers: this.buildHttpHeaders(),
      params
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public synchronizeInvoicesForBilling(): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionsResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_SYNCHRONIZE_INVOICES}`, {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public forceSynchronizeUserInvoicesForBilling(userID: string): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionsResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_FORCE_SYNCHRONIZE_USER_INVOICES}`,
      { userID },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public downloadInvoice(invoiceID: string): Observable<Blob> {
    this.checkInit();
    if (!invoiceID) {
      return EMPTY;
    }
    const url = this.buildRestEndpointUrl(ServerRoute.REST_BILLING_DOWNLOAD_INVOICE, {
      invoiceID
    });
    return this.httpClient.get(url,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public downloadSiteQrCodes(siteID: string): Observable<Blob> {
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['SiteID'] = siteID;
    return this.httpClient.get(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_QRCODE_DOWNLOAD}/`,
      {
        headers: this.buildHttpHeaders(),
        params,
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public downloadSiteAreaQrCodes(siteAreaID?: string): Observable<Blob> {
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['SiteAreaID'] = siteAreaID;
    return this.httpClient.get(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_QRCODE_DOWNLOAD}`,
      {
        headers: this.buildHttpHeaders(),
        params,
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public downloadChargingStationQrCodes(chargingStationID: string, connectorID?: number): Observable<Blob> {
    this.checkInit();
    const params: { [param: string]: string } = {};
    params['ChargingStationID'] = chargingStationID;
    if (connectorID) {
      params['ConnectorID'] = connectorID.toString();
    }
    return this.httpClient.get(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_QRCODE_DOWNLOAD}`,
      {
        headers: this.buildHttpHeaders(),
        params,
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getRegistrationTokens(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<RegistrationTokenDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<RegistrationTokenDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKENS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getRegistrationToken(registrationTokenID: string): Observable<RegistrationToken> {
    // Verify init
    this.checkInit();
    const params: { [param: string]: string } = {};
    // Execute the REST service
    return this.httpClient.get<RegistrationToken>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKEN, { id: registrationTokenID }),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createRegistrationToken(registrationToken: Partial<RegistrationToken> = {}): Observable<RegistrationToken> {
    this.checkInit();
    return this.httpClient.post<RegistrationToken>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKENS), registrationToken,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateRegistrationToken(registrationToken: RegistrationToken): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKEN, { id: registrationToken.id }), registrationToken,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKEN, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public revokeRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_REGISTRATION_TOKEN_REVOKE, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getEndUserLicenseAgreement(language: string): Observable<EndUserLicenseAgreement> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<EndUserLicenseAgreement>(`${this.restServerAuthURL}/${ServerRoute.REST_END_USER_LICENSE_AGREEMENT}`,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
        params: { Language: language }
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public login(user: any): Observable<LoginResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<LoginResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_SIGNIN}`, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public loginSucceeded(token: string): void {
    // Keep the token in local storage
    this.currentUserToken = token;
    this.currentUser = new JwtHelperService().decodeToken(token);
    this.localStorageService.setItem('token', token);
    this.currentUserSubject.next(this.currentUser);
  }

  public getLoggedUser(): UserToken {
    // Get the token
    if (!this.currentUser) {
      this.readAndDecodeTokenFromLocalStorage();
    }
    return this.currentUser;
  }

  public getCurrencyCode(): string {
    // The [ISO 4217] currency code as defined in the Pricing Settings
    // N.B.: An empty string is returned when not yet set!
    return this.getLoggedUser()?.currency;
  }

  public isAuthenticated(): boolean {
    return this.getLoggedUserToken() && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  public getCurrentUserSubject(): BehaviorSubject<UserToken> {
    return this.currentUserSubject;
  }

  public logout(): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_SIGNOUT}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public clearLoginInformation(): void {
    this.dialog.closeAll();
    this.clearLoggedUser();
  }

  public resetUserPassword(data: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    data['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_PASSWORD_RESET}`, data,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public registerUser(user: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_SIGNON}`, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createUser(user: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_USERS), user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateUser(user: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER, { id: user.id });
    return this.httpClient.put<ActionResponse>(url, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createCompany(company: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_COMPANIES), company,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateCompany(company: Company): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_COMPANY, { id: company.id }), company,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteCompany(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_COMPANY, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createAsset(asset: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_ASSETS), asset,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateAsset(asset: Asset): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET, { id: asset.id }), asset,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteAsset(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkAssetConnection(assetConnectionId: string): Observable<CheckAssetConnectionResponse> {
    const params: { [param: string]: string } = {};
    params['ID'] = assetConnectionId;
    // Verify init
    this.checkInit();
    // Execute REST service
    return this.httpClient.get<CheckAssetConnectionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET_CHECK_CONNECTION, { id: assetConnectionId }),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public tableRetrieveAssetConsumptionAction(assetId: string): Observable<ActionResponse> {
    const params: { [param: string]: string } = {};
    // Verify init
    this.checkInit();
    // Execute REST service
    return this.httpClient.get<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_ASSET_RETRIEVE_CONSUMPTION, { id: assetId }),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createSite(site: Site): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITES), site,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSite(site: Site): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE, { id: site.id }), site,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteSite(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createSiteArea(siteArea: SiteArea): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREAS), siteArea,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSiteArea(siteArea: SiteArea): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA, { id: siteArea.id }), siteArea,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteSiteArea(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SITE_AREA, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkSmartChargingConnection(): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.get<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATION_CHECK_SMART_CHARGING_CONNECTION}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSetting(setting: SettingDB): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_SETTING, { id: setting.id }), setting,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createOcpiEndpoint(ocpiEndpoint: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINTS),
      ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public sendEVSEStatusesOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_SEND_EVSE_STATUSES, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public sendTokensOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_SEND_TOKENS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pullLocationsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_PULL_LOCATIONS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pullSessionsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_PULL_SESSIONS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pullTokensOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_PULL_TOKENS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pullCdrsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_PULL_CDRS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkLocationsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_CHECK_LOCATIONS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkCdrsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_CHECK_CDRS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkSessionsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_CHECK_SESSIONS, { id: ocpiEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createOicpEndpoint(oicpEndpoint: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINTS),
      oicpEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public sendEVSEStatusesOicpEndpoint(oicpEndpoint: OicpEndpoint): Observable<OICPJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OICPJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT_SEND_EVSE_STATUSES, { id: oicpEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public sendEVSEsOicpEndpoint(oicpEndpoint: OicpEndpoint): Observable<OICPJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OICPJobStatusesResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT_SEND_EVSES, {id: oicpEndpoint.id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pingOicpEndpoint(oicpEndpoint: any): Observable<OICPPingResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OICPPingResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT_PING, { id: oicpEndpoint.id }), oicpEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateOicpEndpoint(oicpEndpoint: OicpEndpoint): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT, { id: oicpEndpoint.id }), oicpEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteOicpEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public unregisterOicpEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT_UNREGISTER, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public registerOicpEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OICP_ENDPOINT_REGISTER, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pingOcpiEndpoint(ocpiEndpoint: any): Observable<OCPIPingResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIPingResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_PING, { id: ocpiEndpoint.id }), ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public generateLocalTokenOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIGenerateLocalTokenResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<OCPIGenerateLocalTokenResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_GENERATE_LOCAL_TOKEN),
      { name: ocpiEndpoint.name },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT, { id: ocpiEndpoint.id }), ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteOcpiEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public unregisterOcpiEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_UNREGISTER, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public registerOcpiEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(
      this.buildRestEndpointUrl(ServerRoute.REST_OCPI_ENDPOINT_REGISTER, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteUser(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_USER, { id });
    return this.httpClient.delete<ActionResponse>(url,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public verifyEmail(params: FilterParams): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    params['Tenant'] = this.windowService.getSubdomain();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_MAIL_CHECK}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public resendVerificationEmail(user: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerRoute.REST_MAIL_RESEND}`, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteTransaction(id: number): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public refundTransactions(ids: number[]): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_REFUND_ACTION), { transactionIds: ids },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public pushTransactionCdr(id: number): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION_CDR, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public synchronizeRefundedTransactions(): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTIONS_SYNCHRONIZE_REFUNDED), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public softStopTransaction(id: number): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_TRANSACTION_SOFT_STOP, { id }), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationStopTransaction(chargingStationID: string, transactionId: number): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      args: {
        transactionId,
      },
    };
    return this.httpClient.put<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/remote/stop`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationsUnlockConnector(chargingStationID: string, connectorId: number): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargingStationID,
      args: {
        connectorId,
      },
    };
    return this.httpClient.put<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/connectors/${connectorId}/unlock`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationStartTransaction(chargingStationID: string, connectorId: number, userID: string, visualTagID: string, carID?: string): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      carID,
      userID,
      args: {
        visualTagID,
        connectorId
      },
    };
    return this.httpClient.put<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/remote/start`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateChargingStationParams(chargingStation: ChargingStation): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStation.id}/parameters`, chargingStation,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateChargingProfile(chargingProfile: ChargingProfile): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_PROFILES}/${chargingProfile.id}`, chargingProfile,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createChargingProfile(chargingProfile: ChargingProfile): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_PROFILES}`, chargingProfile,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteChargingProfile(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.delete<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_PROFILES}/${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteChargingStation(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationOcppParameters(chargingStationID: string): Observable<DataResult<OcppParameter>> {
    // Verify Init
    this.checkInit();
    // Execute REST Service
    return this.httpClient.get<DataResult<OcppParameter>>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${chargingStationID}/ocpp/parameters`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarCatalogs(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<CarCatalogDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<CarCatalogDataResult>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_CATALOGS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCars(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<CarDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<CarDataResult>(this.buildRestEndpointUrl(ServerRoute.REST_CARS),
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCar(carID: string): Observable<Car> {
    // Verify init
    this.checkInit();
    const params: { [param: string]: string } = {};
    // Execute the REST service
    return this.httpClient.get<Car>(this.buildRestEndpointUrl(ServerRoute.REST_CAR, { id: carID }),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarCatalog(id: number): Observable<CarCatalog> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<CarCatalog>(this.buildRestEndpointUrl(ServerRoute.REST_CAR_CATALOG, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarCatalogImages(id: number, params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING): Observable<DataResult<ImageObject>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ImageObject>>(this.buildRestEndpointUrl(ServerRoute.REST_CAR_CATALOG_IMAGES, { id }),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarMakers(params: FilterParams): Observable<DataResult<CarMaker>> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<DataResult<CarMaker>>(this.buildRestEndpointUrl(ServerRoute.REST_CAR_MAKERS),
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public synchronizeCarsCatalog(): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CAR_CATALOG_SYNCHRONIZE), {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createCar(car: Car, forced: boolean): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CARS), { ...car, forced },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateCar(car: Car): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CAR, { id: car.id }), car,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteCar(id: number): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CAR, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateChargingStationOCPPConfiguration(id: string, chargerParameter: KeyValue): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const custom = chargerParameter.custom ? chargerParameter.custom : false;
    const body = `{
      "args": {
        "key": "${chargerParameter.key}",
        "value": "${chargerParameter.value}",
        "custom": "${custom}"
      }
    }`;
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${id}/configuration`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationCompositeSchedule(id: string, connectorId: number, duration: number, unit: string):
  Observable<GetCompositeScheduleCommandResult | GetCompositeScheduleCommandResult[]> {
    // Verify init
    this.checkInit();
    // build request
    const body =
      `{
        "args": {
          "connectorId": ${connectorId},
          "duration": ${duration},
          "chargingRateUnit": "${unit}"
        }
      }`;
    // Execute
    return this.httpClient.put<GetCompositeScheduleCommandResult | GetCompositeScheduleCommandResult[]>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${id}/compositeschedule`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationLimitPower(
    charger: ChargingStation, chargePoint: ChargePoint,
    connectorId?: number, ampLimitValue: number = 0,
    forceUpdateChargingPlan: boolean = false): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${charger.id}/power/limit`, {
      chargePointID: chargePoint.chargePointID,
      connectorId,
      ampLimitValue,
      forceUpdateChargingPlan,
    },
    {
      headers: this.buildHttpHeaders(),
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public chargingStationSetChargingProfile(charger: ChargingStation, connectorId: number, chargingProfile: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Build default charging profile json
    const body = `{
      "chargingStationID": "${charger.id}",
      "args": {
        "connectorId": 0,
        "csChargingProfiles": ${JSON.stringify(chargingProfile)}
      }
    }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_SET_CHARGING_PROFILE}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationUpdateFirmware(charger: ChargingStation, locationURL: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const date = new Date().toISOString();
    const body = (
      `{
        "args": {
          "location": "${locationURL}",
          "retries": 0,
          "retrieveDate": "${date}",
          "retryInterval": 0
        }
      }`
    );
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS}/${charger.id}/firmware/update`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationChangeAvailability(id: string, available: boolean, connectorID: number = 0): Observable<ActionResponse> {
    return this.actionChargingStation(
      `${ServerRoute.REST_CHARGING_STATIONS}/${id}/availability/change`, JSON.stringify({
        connectorId: connectorID,
        type: available ? OCPPAvailabilityType.OPERATIVE : OCPPAvailabilityType.INOPERATIVE,
      })
    );
  }

  public chargingStationReset(id: string, hard: boolean = false): Observable<ActionResponse> {
    return this.actionChargingStation(
      `${ServerRoute.REST_CHARGING_STATIONS}/${id}/reset`, JSON.stringify({ type: hard ? OCPPResetType.HARD : OCPPResetType.SOFT }));
  }

  public chargingStationClearCache(id: string): Observable<ActionResponse> {
    return this.actionChargingStation(`${ServerRoute.REST_CHARGING_STATIONS}/${id}/cache/clear`, '');
  }

  public actionChargingStation(action: string, args: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const body = (args ?
      `{
        "args": ${args}
      }` : ''
    );
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.restServerSecuredURL}/${action}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public requestChargingStationOcppParameters(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_REQUEST_OCPP_PARAMETERS}`, {
      chargingStationID: id,
      forceUpdateOCPPParamsFromTemplate: false,
    },
    {
      headers: this.buildHttpHeaders(),
    }).pipe(
      catchError(this.handleHttpError),
    );
  }

  public updateChargingStationOCPPParamWithTemplate(id: string) {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(
      `${this.restServerSecuredURL}/${ServerRoute.REST_CHARGING_STATIONS_REQUEST_OCPP_PARAMETERS}`,
      {
        chargingStationID: id,
        forceUpdateOCPPParamsFromTemplate: true,
      },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getIntegrationConnections(userId: string): Observable<DataResult<IntegrationConnection>> {
    this.checkInit();
    return this.httpClient.get<DataResult<IntegrationConnection>>(this.buildRestEndpointUrl(ServerRoute.REST_CONNECTIONS),
      {
        params: {
          UserID: userId
        },
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createIntegrationConnection(connection: UserConnection) {
    this.checkInit();
    return this.httpClient.post<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CONNECTIONS), connection,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteIntegrationConnection(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(this.buildRestEndpointUrl(ServerRoute.REST_CONNECTION, { id }),
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createPricingDefinition(pricingDefinition: PricingDefinition): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_PRICING_DEFINITIONS);
    return this.httpClient.post<ActionResponse>(url, pricingDefinition,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getPricingDefinition(id: string): Observable<PricingDefinition> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    if (!id) {
      return EMPTY;
    }
    const url = this.buildRestEndpointUrl(ServerRoute.REST_PRICING_DEFINITION, { id });
    return this.httpClient.get<PricingDefinition>(url,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getPricingDefinitions(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [],
    context?: { entityID: string; entityType: string}): Observable<PricingDefinitionDataResult> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    const url = this.buildRestEndpointUrl(ServerRoute.REST_PRICING_DEFINITIONS);
    // Execute the REST service
    return this.httpClient.get<PricingDefinitionDataResult>(url,
      {
        headers: this.buildHttpHeaders(),
        params: {
          ...params,
          EntityID: context.entityID,
          EntityType: context.entityType,
        }
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updatePricingDefinition(pricingDefinition: PricingDefinition): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const url = this.buildRestEndpointUrl(ServerRoute.REST_PRICING_DEFINITION, { id: pricingDefinition.id });
    return this.httpClient.put<ActionResponse>(url, pricingDefinition,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deletePricingDefinition(id: string) {
    // Verify init
    this.checkInit();
    const params = {
      headers: this.buildHttpHeaders(),
    };
    const url = this.buildRestEndpointUrl(ServerRoute.REST_PRICING_DEFINITION, { id });
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(url, params)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public buildImportTagsUsersHttpHeaders(
    autoActivateUserAtImport?: string, autoActivateTagAtImport?: string): { name: string; value: string }[] {
    // Build File Header
    return [
      {
        name: 'Authorization',
        value: 'Bearer ' + this.getLoggedUserToken()
      },
      {
        name: 'autoActivateUserAtImport',
        value: autoActivateUserAtImport
      },
      {
        name: 'autoActivateTagAtImport',
        value: autoActivateTagAtImport
      },
    ];
  }

  public buildRestEndpointUrl(urlPatternAsString: ServerRoute, params: { [name: string]: string | number | null } = {}, urlPrefix = this.restServerSecuredURL): string {
    let resolvedUrlPattern = urlPatternAsString as string;
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        resolvedUrlPattern = resolvedUrlPattern.replace(`:${key}`, encodeURIComponent(params[key]));
      }
    }
    return `${urlPrefix}/${resolvedUrlPattern}`;
  }

  public buildUtilRestEndpointUrl(urlPatternAsString: ServerRoute, params: { [name: string]: string | number | null } = {}): string {
    return this.buildRestEndpointUrl(urlPatternAsString, params, this.restServerServiceUtilURL);
  }

  private getLoggedUserToken(): string {
    // Get the token
    if (!this.currentUserToken) {
      this.readAndDecodeTokenFromLocalStorage();
    }
    return this.currentUserToken;
  }

  private readAndDecodeTokenFromLocalStorage() {
    // Read the token
    this.localStorageService.getItem('token').subscribe((token: string) => {
      this.currentUserToken = token;
      this.currentUser = null;
      // Decode the token
      if (token) {
        this.currentUser = new JwtHelperService().decodeToken(token);
      }
      this.currentUserSubject.next(this.currentUser);
    });
  }

  private clearLoggedUser(): void {
    // Clear
    this.currentUserToken = null;
    this.currentUser = null;
    this.localStorageService.removeItem('token');
    this.currentUserSubject.next(this.currentUser);
  }

  private checkInit(): void {
    // Initialized?
    if (!this.initialized) {
      // No: Process the init
      // Get the server config
      this.centralSystemServerConfig = this.configService.getCentralSystemServer();
      // Build Central Service URL
      this.centralRestServerServiceBaseURL = `${this.centralSystemServerConfig.protocol}://${this.centralSystemServerConfig.host}`;
      if (this.centralSystemServerConfig.port) {
        this.centralRestServerServiceBaseURL += `:${this.centralSystemServerConfig.port}`;
      }
      // Auth API
      this.restServerAuthURL = `${this.centralRestServerServiceBaseURL}/v1/auth`;
      // REST Secured API
      this.restServerSecuredURL = `${this.centralRestServerServiceBaseURL}/v1/api`;
      // REST Util API
      this.restServerServiceUtilURL = `${this.centralRestServerServiceBaseURL}/v1/util`;
      // Secured API
      this.centralRestServerServiceSecuredURL = `${this.centralRestServerServiceBaseURL}/client/api`;
      // Util API
      this.centralRestServerServiceUtilURL = `${this.centralRestServerServiceBaseURL}/client/util`;
      // Done
      this.initialized = true;
    }
  }

  private buildHttpHeaders(tenantID?: string): HttpHeaders {
    const header = {
      'Content-Type': 'application/json'
    };
    if (!Utils.isUndefined(tenantID)) {
      header['Tenant'] = tenantID;
    }
    // Check token
    if (this.getLoggedUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getLoggedUserToken();
    }
    // Build Header
    return new HttpHeaders(header);
  }

  private getSorting(ordering: Ordering[], queryParams: FilterParams) {
    if (!Utils.isEmptyArray(ordering)) {
      const sortFields: string[] = [];
      for (const order of ordering) {
        if (order.field) {
          sortFields.push(order.field);
        }
      }
      if (!Utils.isEmptyArray(sortFields)) {
        queryParams['SortFields'] = sortFields;
      }
    }
  }

  private getPaging(paging: Paging, queryParams: FilterParams) {
    // Limit
    if (paging.limit) {
      queryParams['Limit'] = paging.limit.toString();
    }
    // Skip
    if (paging.skip) {
      queryParams['Skip'] = paging.skip.toString();
    }
  }

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    // We might use a remote logging infrastructure
    const errMsg = { status: 0, message: '', details: undefined };
    if (error && error instanceof TimeoutError) {
      errMsg.status = StatusCodes.REQUEST_TIMEOUT;
      errMsg.message = error.message;
      errMsg.details = undefined;
    } else if (error) {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
      errMsg.details = error.error ? error.error : undefined;
    }
    return throwError(errMsg);
  }

  private processImage(blob: Blob): Observable<string> {
    if (blob.size > 0) {
      return new Observable(observer => {
        const reader = new FileReader();
        reader.readAsDataURL(blob); // convert blob to base64
        reader.onloadend = () => {
          observer.next(reader.result?.toString()); // emit the base64 string result
        };
      });
    }
    return of(null);
  }
}

