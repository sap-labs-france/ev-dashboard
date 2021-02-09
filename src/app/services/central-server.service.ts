import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StatusCodes } from 'http-status-codes';
import { BehaviorSubject, EMPTY, Observable, TimeoutError, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { Asset, AssetConsumption } from '../types/Asset';
import { BillingInvoice, BillingTax } from '../types/Billing';
import { Car, CarCatalog, CarMaker, ImageObject } from '../types/Car';
import { ChargingProfile, GetCompositeScheduleCommandResult } from '../types/ChargingProfile';
import { ChargePoint, ChargingStation, OCPPAvailabilityType, OcppParameter } from '../types/ChargingStation';
import { Company } from '../types/Company';
import CentralSystemServerConfiguration from '../types/configuration/CentralSystemServerConfiguration';
import { IntegrationConnection, UserConnection } from '../types/Connection';
import { ActionResponse, ActionsResponse, CheckAssetConnectionResponse, CheckBillingConnectionResponse, DataResult, LoginResponse, OCPIGenerateLocalTokenResponse, OCPIJobStatusesResponse, OCPIPingResponse, Ordering, Paging } from '../types/DataResult';
import { EndUserLicenseAgreement } from '../types/Eula';
import { FilterParams, Image, KeyValue } from '../types/GlobalType';
import { AssetInError, ChargingStationInError, TransactionInError } from '../types/InError';
import { Log } from '../types/Log';
import { OcpiEndpoint } from '../types/ocpi/OCPIEndpoint';
import { OCPPResetType } from '../types/ocpp/OCPP';
import { RefundReport } from '../types/Refund';
import { RegistrationToken } from '../types/RegistrationToken';
import { ServerAction } from '../types/Server';
import { Setting } from '../types/Setting';
import { Site, SiteUser } from '../types/Site';
import { SiteArea, SiteAreaConsumption } from '../types/SiteArea';
import { StatisticData } from '../types/Statistic';
import { Tag } from '../types/Tag';
import { Tenant } from '../types/Tenant';
import { OcpiData, Transaction } from '../types/Transaction';
import { User, UserCar, UserDefaultTagCar, UserSite, UserToken } from '../types/User';
import { Constants } from '../utils/Constants';
import { Utils } from '../utils/Utils';
import { CentralServerNotificationService } from './central-server-notification.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { WindowService } from './window.service';

@Injectable()
export class CentralServerService {
  private centralRestServerServiceBaseURL!: string;
  private centralRestServerServiceSecuredURL!: string;
  private centralRestServerServiceUtilURL!: string;
  private restServerAuthURL!: string;
  private centralSystemServerConfig: CentralSystemServerConfiguration;
  private initialized = false;
  private currentUserToken!: string;
  private currentUser!: UserToken;
  private currentUserSubject = new BehaviorSubject<UserToken>(this.currentUser);

  constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private centralServerNotificationService: CentralServerNotificationService,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REMOVE_CHARGING_STATIONS_FROM_SITE_AREA}`,
      { siteAreaID, chargingStationIDs: chargerIDs },
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_DELETE}`, options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addChargersToSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ADD_CHARGING_STATIONS_TO_SITE_AREA}`,
      { siteAreaID, chargingStationIDs: chargerIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ADD_ASSET_TO_SITE_AREA}`,
      { siteAreaID, assetIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REMOVE_ASSET_TO_SITE_AREA}`,
      { siteAreaID, assetIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REMOVE_USERS_FROM_SITE}`,
      { siteID, userIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ADD_USERS_TO_SITE}`,
      { siteID, userIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSiteUserAdmin(siteID: string, userID: string, siteAdmin: boolean): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_USER_ADMIN}`,
      { siteID, userID, siteAdmin },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSiteOwner(siteID: string, userID: string, siteOwner: boolean): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_OWNER}`,
      { siteID, userID, siteOwner },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REMOVE_SITES_FROM_USER}`,
      { userID, siteIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ADD_SITES_TO_USER}`,
      { userID, siteIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanies(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Company>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Company>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.COMPANIES}`,
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
    params['ID'] = companyId;
    params['WithLogo'] = withLogo.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Company>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.COMPANY}`,
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
    params['ID'] = companyID;
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(`${this.centralRestServerServiceUtilURL}/${ServerAction.COMPANY_LOGO}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
        catchError(this.handleHttpError),
      );
  }

  public getAssets(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Asset>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Asset>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSETS}`,
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
    params['ID'] = assetId;
    params['WithImage'] = withImage.toString();
    params['WithSiteArea'] = withSiteArea.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Asset>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSET}`,
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
    params['ID'] = assetID;
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(`${this.centralRestServerServiceUtilURL}/${ServerAction.ASSET_IMAGE}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
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
    return this.httpClient.get<DataResult<AssetInError>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSETS_IN_ERROR}`,
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
    return this.httpClient.get<DataResult<SiteUser>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_SITES}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSites(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Site>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Site>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITES}`,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_PROFILES}`,
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
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRIGGER_SMART_CHARGING}`,
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
    params['ID'] = siteID;
    params['WithImage'] = withImage.toString();
    params['WithCompany'] = withImage.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Site>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE}`,
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
    params['ID'] = siteID;
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(`${this.centralRestServerServiceUtilURL}/${ServerAction.SITE_IMAGE}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreas(params: FilterParams = {},
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteArea>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteArea>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREAS}`,
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
    params['ID'] = siteAreaID;
    if (withSite) {
      params['WithSite'] = withSite.toString();
    }
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteArea>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREA}`,
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
    params['ID'] = siteAreaID;
    params['TenantID'] = this.currentUser?.tenantID;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Blob>(`${this.centralRestServerServiceUtilURL}/${ServerAction.SITE_AREA_IMAGE}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
        catchError(this.handleHttpError),
      );
  }

  public getTransactionYears(): Observable<number[]> {
    const params: { [param: string]: string } = {};
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<number[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_YEARS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_CONSUMPTION_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_CONSUMPTION_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_USAGE_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_USAGE_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_INACTIVITY_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_INACTIVITY_STATISTICS}`,
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
    params['ChargeBoxID'] = chargingStationID;
    params['ConnectorId'] = connectorID.toString();
    params['Limit'] = '1';
    params['Skip'] = '0';
    params['SortFields'] = '-timestamp';
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_TRANSACTIONS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_TRANSACTIONS_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_TRANSACTIONS_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_PRICING_STATISTICS}`,
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
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_PRICING_STATISTICS}`,
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
    return this.httpClient.get<DataResult<ChargingStation>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATIONS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  public getChargingStation(id: string): Observable<ChargingStation> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<ChargingStation>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION}`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getConnectorQrCode(chargeBoxID: string, connectorID: number): Observable<Image> {
    // Verify init
    this.checkInit();
    if (!chargeBoxID || connectorID < 0) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.GENERATE_QR_CODE_FOR_CONNECTOR}`,
      {
        headers: this.buildHttpHeaders(),
        params: {
          ChargeBoxID: chargeBoxID,
          ConnectorID: connectorID.toString()
        },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getChargingStationsInError(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingStationInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargingStationInError>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATIONS_IN_ERROR}`,
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
    return this.httpClient.get<DataResult<UserSite>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_USERS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUsers(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USERS}`,
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
    params['ID'] = tagID;
    // Execute the REST service
    return this.httpClient.get<Tag>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAG}`,
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
    const params: { [param: string]: string } = {};
    params['UserID'] = userID;
    // Execute the REST service
    return this.httpClient.get<UserDefaultTagCar>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_DEFAUlT_TAG_CAR}`,
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTags(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Tag>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Tag>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAGS}`,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAG_DELETE}?ID=${id}`,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAGS_DELETE}`, options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createTag(tag: Tag): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAG_CREATE}`, tag,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TAG_UPDATE}`, tag,
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
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USERS_IN_ERROR}`,
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
    return this.httpClient.get<DataResult<Tenant>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TENANTS}`,
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
    return this.httpClient.get<Tenant>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TENANT}`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id },
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
      `${this.centralRestServerServiceUtilURL}/${ServerAction.TENANT_LOGO}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
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
      `${this.centralRestServerServiceUtilURL}/${ServerAction.TENANT_LOGO}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob' as 'json',
        params,
      })
      .pipe(
        switchMap((blob: Blob) => {
          return this.processImage(blob);
        }),
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
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_COMPLETED}`,
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
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_TO_REFUND}`,
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
    return this.httpClient.get<DataResult<RefundReport>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_TO_REFUND_REPORTS}`,
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
    return this.httpClient.get<OcpiData>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_OCPI_CDR_EXPORT}`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id.toString() },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public assignTransactionsToUser(userID: string, tagID: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSIGN_TRANSACTIONS_TO_USER}`,
      null,
      {
        headers: this.buildHttpHeaders(),
        params: {
          UserID: userID,
          TagID: tagID,
        },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUnassignedTransactionsCount(tagID: string): Observable<number> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<number>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.UNASSIGNED_TRANSACTIONS_COUNT}`,
      {
        headers: this.buildHttpHeaders(),
        params: {
          TagID: tagID
        },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransaction(id: number): Observable<Transaction> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Transaction>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION}`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id.toString() },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public rebuildTransactionConsumption(id: number): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REBUILD_TRANSACTION_CONSUMPTIONS}`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id.toString() },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportLogs(params: FilterParams): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.LOGGINGS_EXPORT}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USERS_EXPORT}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_EXPORT}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_TO_REFUND_EXPORT}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.STATISTICS_EXPORT}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATIONS_EXPORT}`,
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
    // Verify init
    this.checkInit();
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATIONS_OCPP_PARAMS_EXPORT}`,
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
    return this.httpClient.get<DataResult<TransactionInError>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_IN_ERROR}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getActiveTransactions(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [])
    : Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_ACTIVE}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getOcpiEndpoints(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<OcpiEndpoint>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<OcpiEndpoint>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENDPOINTS}`,
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
    params['SiteAreaID'] = siteAreaID;
    params['StartDate'] = startDate.toISOString();
    params['EndDate'] = endDate.toISOString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteAreaConsumption>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREA_CONSUMPTION}`,
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
    params['AssetID'] = assetID;
    params['StartDate'] = startDate.toISOString();
    params['EndDate'] = endDate.toISOString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<AssetConsumption>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSET_CONSUMPTION}`,
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
    params['TransactionId'] = transactionId.toString();
    if (loadAllConsumptions) {
      params['LoadAllConsumptions'] = loadAllConsumptions.toString();
    }
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Transaction>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_CONSUMPTION}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TENANT_CREATE}`, tenant,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TENANT_UPDATE}`, tenant,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TENANT_DELETE}?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLogs(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Log>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Log>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.LOGGINGS}`,
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
    return this.httpClient.get<Log>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.LOGGING}?ID=${id}`,
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
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_IMAGE}?ID=${id}`,
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
    return this.httpClient.get<User>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER}?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserInvoice(id: string): Observable<Blob> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_USER_INVOICE}?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSettings(identifier: string, contentFilter = false): Observable<DataResult<Setting>> {
    // verify init
    this.checkInit();
    // Execute the REST Service
    return this.httpClient.get<DataResult<Setting>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SETTINGS}?Identifier=${identifier}&ContentFilter=${contentFilter}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public checkBillingConnection(): Observable<CheckBillingConnectionResponse> {
    // verify init
    this.checkInit();
    // Execute the REST Service
    return this.httpClient.get<CheckBillingConnectionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHECK_BILLING_CONNECTION}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
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

  public getUserInvoices(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<BillingInvoice>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<BillingInvoice>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_INVOICES}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
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

  public createTransactionInvoice(transactionID: number): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_CREATE_TRANSACTION_INVOICE}`, { transactionID },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public downloadInvoice(id: string): Observable<Blob> {
    this.checkInit();
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.BILLING_DOWNLOAD_INVOICE}?ID=${id}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_DOWNLOAD_QR_CODE_PDF}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_DOWNLOAD_QR_CODE_PDF}`,
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
    params['ChargeBoxID'] = chargingStationID;
    if (connectorID) {
      params['ConnectorID'] = connectorID.toString();
    }
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_DOWNLOAD_QR_CODE_PDF}`,
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
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<RegistrationToken>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<RegistrationToken>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKENS}`,
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
    params['ID'] = registrationTokenID;
    // Execute the REST service
    return this.httpClient.get<RegistrationToken>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKEN}`,
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
    return this.httpClient.post<RegistrationToken>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKEN_CREATE}`, registrationToken,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKEN_UPDATE}`, registrationToken,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKEN_DELETE}?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public revokeRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.REGISTRATION_TOKEN_REVOKE}?ID=${id}`,
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
    return this.httpClient.get<EndUserLicenseAgreement>(`${this.restServerAuthURL}/${ServerAction.REST_END_USER_LICENSE_AGREEMENT}`,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
        params: { language }
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
    return this.httpClient.post<LoginResponse>(`${this.restServerAuthURL}/${ServerAction.REST_SIGNIN}`, user,
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
    // Notify
    this.currentUserSubject.next(this.currentUser);
    // Init Socket IO at user login
    if (this.configService.getCentralSystemServer().socketIOEnabled) {
      this.centralServerNotificationService.initSocketIO(token);
    }
  }

  public getLoggedUser(): UserToken {
    // Get the token
    if (!this.currentUser) {
      this.readAndDecodeTokenFromLocalStorage();
    }
    return this.currentUser;
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
      // Notify
      this.currentUserSubject.next(this.currentUser);
    });
  }

  public isAuthenticated(): boolean {
    return this.getLoggedUserToken() && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  public getCurrentUserSubject(): BehaviorSubject<UserToken> {
    return this.currentUserSubject;
  }

  private clearLoggedUser(): void {
    // Clear
    this.currentUserToken = null;
    this.currentUser = null;
    this.localStorageService.removeItem('token');
    this.currentUserSubject.next(this.currentUser);
  }

  public logout(): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.restServerAuthURL}/${ServerAction.REST_SIGNOUT}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public logoutSucceeded(): void {
    this.dialog.closeAll();
    this.clearLoggedUser();
    if (this.configService.getCentralSystemServer().socketIOEnabled) {
      this.centralServerNotificationService.resetSocketIO();
    }
  }

  public resetUserPassword(data: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    data['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerAction.REST_PASSWORD_RESET}`, data,
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
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerAction.REST_SIGNON}`, user,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_CREATE}`, user,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_UPDATE}`, user,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.COMPANY_CREATE}`, company,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateCompany(company: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.COMPANY_UPDATE}`, company,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.COMPANY_DELETE}?ID=${id}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSET_CREATE}`, asset,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateAsset(asset: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSET_UPDATE}`, asset,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.ASSET_DELETE}?ID=${id}`,
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
    return this.httpClient.get<CheckAssetConnectionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHECK_ASSET_CONNECTION}`,
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
    params['ID'] = assetId;
    // Verify init
    this.checkInit();
    // Execute REST service
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.RETRIEVE_ASSET_CONSUMPTION}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_CREATE}`, site,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_UPDATE}`, site,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_DELETE}?ID=${id}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREA_CREATE}`, siteArea,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREA_UPDATE}`, siteArea,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SITE_AREA_DELETE}?ID=${id}`,
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
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHECK_SMART_CHARGING_CONNECTION}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateSetting(setting: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SETTING_UPDATE}`, setting,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_CREATE}`,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_SEND_EVSE_STATUSES}`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public sendTokensOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_SEND_TOKENS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_PULL_LOCATIONS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_PULL_SESSIONS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_PULL_TOKENS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_PULL_CDRS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_CHECK_LOCATIONS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_CHECK_CDRS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_CHECK_SESSIONS}`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIPingResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_PING}`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public generateLocalTokenOcpiEndpoint(ocpiEndpoint: any): Observable<OCPIGenerateLocalTokenResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPIGenerateLocalTokenResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENPOINT_GENERATE_LOCAL_TOKEN}`, ocpiEndpoint,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENDPOINT_UPDATE}`, ocpiEndpoint,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENDPOINT_DELETE}?ID=${id}`,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENDPOINT_UNREGISTER}?ID=${id}`,
      `{ "id": "${id}" }`,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.OCPI_ENDPOINT_REGISTER}?ID=${id}`,
      `{ "id": "${id}" }`,
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
    return this.httpClient.delete<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.USER_DELETE}?ID=${id}`,
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
    return this.httpClient.get<ActionResponse>(`${this.restServerAuthURL}/${ServerAction.REST_MAIL_CHECK}`,
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
    return this.httpClient.post<ActionResponse>(`${this.restServerAuthURL}/${ServerAction.REST_MAIL_RESEND}`, user,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_DELETE}?ID=${id}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTIONS_REFUND}`, { transactionIds: ids },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_PUSH_CDR}`,
      { transactionId: id },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SYNCHRONIZE_REFUNDED_TRANSACTIONS}`, {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public softStopTransaction(id: number): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.TRANSACTION_SOFT_STOP}`,
      `{ "ID": "${id}" }`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationStopTransaction(chargeBoxId: string, transactionId: number): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        transactionId,
      },
    };
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_REMOTE_STOP_TRANSACTION}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationsUnlockConnector(chargeBoxId: string, connectorId: number): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        connectorId,
      },
    };
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_UNLOCK_CONNECTOR}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationStartTransaction(chargeBoxId: string, connectorId: number, tagID: string, carID?: string): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      carID,
      args: {
        tagID,
        connectorId,
      },
    };
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_REMOTE_START_TRANSACTION}`, body,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_UPDATE_PARAMS}`, chargingStation,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_PROFILE_UPDATE}`, chargingProfile,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_PROFILE_DELETE}?ID=${id}`,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_DELETE}?ID=${id}`,
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
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATIONS_OCPP_PARAMETERS}?ChargeBoxID=${chargingStationID}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarCatalogs(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<CarCatalog>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<CarCatalog>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_CATALOGS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCars(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Car>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Car>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CARS}`,
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
    params['ID'] = carID;
    // Execute the REST service
    return this.httpClient.get<Car>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR}`,
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarUsers(params: FilterParams,
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<UserCar>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<UserCar>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_USERS}`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCarCatalog(id: number): Observable<CarCatalog> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<CarCatalog>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_CATALOG}?ID=${id}`,
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
    return this.httpClient.get<DataResult<ImageObject>>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_CATALOG_IMAGES}?ID=${id}`,
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
    return this.httpClient.get<DataResult<CarMaker>>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_MAKERS}`,
      {
        headers: this.buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public synchronizeCarsCatalog(): Observable<ActionsResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionsResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.SYNCHRONIZE_CAR_CATALOGS}`, {},
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_CREATE}`, { ...car, forced },
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CAR_UPDATE}`, car,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CarDelete?ID=${id}`,
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
      "chargeBoxID": "${id}",
      "args": {
        "key": "${chargerParameter.key}",
        "value": "${chargerParameter.value}",
        "custom": "${custom}"
      }
    }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_CHANGE_CONFIGURATION}`, body,
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
        "chargeBoxID": "${id}",
        "args": {
          "connectorId": ${connectorId},
          "duration": ${duration},
          "chargingRateUnit": "${unit}"
        }
      }`;
    // Execute
    return this.httpClient.post<GetCompositeScheduleCommandResult | GetCompositeScheduleCommandResult[]>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_GET_COMPOSITE_SCHEDULE}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationLimitPower(charger: ChargingStation, chargePoint: ChargePoint, connectorId?: number, ampLimitValue: number = 0, forceUpdateChargingPlan: boolean = false): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_LIMIT_POWER}`, {
      chargeBoxID: charger.id,
      chargePointID: chargePoint.chargePointID,
      connectorId,
      ampLimitValue,
      forceUpdateChargingPlan,
    },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationSetChargingProfile(charger: ChargingStation, connectorId: number, chargingProfile: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Build default charging profile json
    let body: string;
    body = `{
      "chargeBoxID": "${charger.id}",
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
        "chargeBoxID": "${charger.id}",
        "args": {
          "location": "${locationURL}",
          "retries": 0,
          "retrieveDate": "${date}",
          "retryInterval": 0
        }
      }`
    );
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_UPDATE_FIRMWARE}`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationChangeAvailability(id: string, available: boolean, connectorID: number = 0): Observable<ActionResponse> {
    return this.actionChargingStation(
      ServerAction.CHARGING_STATION_CHANGE_AVAILABILITY, id, JSON.stringify({
        connectorId: connectorID,
        type: available ? OCPPAvailabilityType.OPERATIVE : OCPPAvailabilityType.INOPERATIVE,
      })
    );
  }

  public chargingStationReset(id: string, hard: boolean = false): Observable<ActionResponse> {
    return this.actionChargingStation(
      ServerAction.CHARGING_STATION_RESET, id, JSON.stringify({ type: hard ? OCPPResetType.HARD : OCPPResetType.SOFT }));
  }

  public chargingStationClearCache(id: string): Observable<ActionResponse> {
    return this.actionChargingStation(ServerAction.CHARGING_STATION_CLEAR_CACHE, id, '');
  }

  public actionChargingStation(action: string, id: string, args: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const body = (args ?
      `{
        "chargeBoxID": "${id}",
        "args": ${args}
      }` :
      `{
        "chargeBoxID": "${id}"
      }`
    );
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/${action}`, body,
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
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_REQUEST_OCPP_PARAMETERS}`,
      {
        chargeBoxID: id,
        forceUpdateOCPPParamsFromTemplate: false,
      },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public updateChargingStationOCPPParamWithTemplate(id: string) {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.CHARGING_STATION_REQUEST_OCPP_PARAMETERS}`,
      {
        chargeBoxID: id,
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
    return this.httpClient.get<DataResult<IntegrationConnection>>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.INTEGRATION_CONNECTIONS}?UserID=${userId}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createIntegrationConnection(connection: UserConnection) {
    this.checkInit();
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.INTEGRATION_CONNECTION_CREATE}`, connection,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteIntegrationConnection(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/${ServerAction.INTEGRATION_CONNECTION_DELETE}?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  private checkInit(): void {
    // Initialized?
    if (!this.initialized) {
      // No: Process the init
      // Get the server config
      this.centralSystemServerConfig = this.configService.getCentralSystemServer();
      // Build Central Service URL
      this.centralRestServerServiceBaseURL = this.centralSystemServerConfig.protocol + '://' +
        this.centralSystemServerConfig.host + ':' + this.centralSystemServerConfig.port;
      // Set REST base URL
      this.centralServerNotificationService.setcentralRestServerServiceURL(this.centralRestServerServiceBaseURL);
      // Auth API
      this.restServerAuthURL = this.centralRestServerServiceBaseURL + '/v1/auth';
      // Secured API
      this.centralRestServerServiceSecuredURL = this.centralRestServerServiceBaseURL + '/client/api';
      // Util API
      this.centralRestServerServiceUtilURL = this.centralRestServerServiceBaseURL + '/client/util';
      // Init Socket IO if user already logged
      if (this.configService.getCentralSystemServer().socketIOEnabled && this.isAuthenticated()) {
        this.centralServerNotificationService.initSocketIO(this.getLoggedUserToken());
      }
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
    // Check
    if (ordering && ordering.length) {
      const sortFields: string[] = [];
      for (const order of ordering) {
        if (order.field) {
          sortFields.push(order.field);
        }
      }
      if (sortFields.length > 0) {
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
        const  reader = new FileReader();
        reader.readAsDataURL(blob); // convert blob to base64
        reader.onloadend = () => {
          observer.next(reader.result?.toString()); // emit the base64 string result
        };
      });
    }
    return of(null);
  }
}
