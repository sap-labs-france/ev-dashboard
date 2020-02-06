import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TranslateService } from '@ngx-translate/core';
import { BillingTax } from 'app/types/Billing';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { ChargingStation, ChargingStationConfiguration } from 'app/types/ChargingStation';
import { Company } from 'app/types/Company';
import { IntegrationConnection, UserConnection } from 'app/types/Connection';
import { ActionsResponse, ActionResponse, DataResult, LoginResponse, Ordering, OCPIGenerateLocalTokenResponse, OCPIJobStatusesResponse, OCPIPingResponse, OCPITriggerJobsResponse, Paging, SynchronizeResponse, ValidateBillingConnectionResponse } from 'app/types/DataResult';
import { EndUserLicenseAgreement } from 'app/types/Eula';
import { Image, KeyValue, Logo } from 'app/types/GlobalType';
import { ChargingStationInError, TransactionInError } from 'app/types/InError';
import { Log } from 'app/types/Log';
import { OcpiEndpoint } from 'app/types/OCPIEndpoint';
import { RefundReport } from 'app/types/Refund';
import { RegistrationToken } from 'app/types/RegistrationToken';
import { Setting } from 'app/types/Setting';
import { Site, SiteUser, UserSite } from 'app/types/Site';
import { SiteArea } from 'app/types/SiteArea';
import { CurrentMetrics, StatisticData } from 'app/types/Statistic';
import { Tenant } from 'app/types/Tenant';
import { Transaction } from 'app/types/Transaction';
import { User, UserToken } from 'app/types/User';
import { throwError, BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Constants } from '../utils/Constants';
import { CentralServerNotificationService } from './central-server-notification.service';
import { ConfigService } from './config.service';
import { LocalStorageService } from './local-storage.service';
import { WindowService } from './window.service';

@Injectable()
export class CentralServerService {
  private centralRestServerServiceBaseURL!: string;
  private centralRestServerServiceSecuredURL!: string;
  private centralRestServerServiceAuthURL!: string;
  private centralRestServerServiceUtilURL!: string;
  private centralSystemServerConfig: any;
  private initialized = false;
  private currentUserToken!: string;
  private currentUser!: UserToken;
  private currentUserSubject = new BehaviorSubject<UserToken>(this.currentUser);

  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private centralServerNotificationService: CentralServerNotificationService,
    private configService: ConfigService,
    private windowService: WindowService,
    private dialog: MatDialog) {
    // Default
    this.initialized = false;
  }

  public removeChargersFromSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveChargingStationsFromSiteArea`,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionsDelete`, options)
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public addChargersToSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddChargingStationsToSiteArea`,
      { siteAreaID, chargingStationIDs: chargerIDs },
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveUsersFromSite`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddUsersToSite`,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteUserAdmin`,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteOwner`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveSitesFromUser`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddSitesToUser`,
      { userID, siteIDs },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanies(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Company>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Company>>(
      `${this.centralRestServerServiceSecuredURL}/Companies`,
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
    return this.httpClient.get<Company>(
      `${this.centralRestServerServiceSecuredURL}/Company`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanyLogos(): Observable<Logo[]> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo[]>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogos`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCompanyLogo(companyId: string): Observable<Logo> {
    const params: { [param: string]: string } = {};
    params['ID'] = companyId;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogo`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserSites(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteUser>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteUser>>(`${this.centralRestServerServiceSecuredURL}/UserSites`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSites(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Site>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Site>>(
      `${this.centralRestServerServiceSecuredURL}/Sites`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingProfile(ChargeBoxID: string): Observable<ChargingProfile> {
    const params: { [param: string]: string } = {};
    params['ChargeBoxID'] = ChargeBoxID;
    this.checkInit();
    return this.httpClient.get<ChargingProfile>(
      `${this.centralRestServerServiceSecuredURL}/ChargingProfile`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSite(siteId: string, withImage: boolean = false): Observable<Site> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteId;
    params['WithImage'] = withImage.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Site>(
      `${this.centralRestServerServiceSecuredURL}/Site`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteImage(siteId: string): Observable<Image> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteId;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteImage`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreas(params: { [param: string]: string | string[]; } = {},
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteArea>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteArea>>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreas`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteArea(siteAreaId: string): Observable<SiteArea> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteAreaId;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteArea>(
      `${this.centralRestServerServiceSecuredURL}/SiteArea`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteAreaImage(siteAreaId: string): Observable<Image> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteAreaId;
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreaImage`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionYears(): Observable<number[]> {
    const params: { [param: string]: string } = {};
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<number[]>(`${this.centralRestServerServiceSecuredURL}/TransactionYears`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationConsumptionStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserConsumptionStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserConsumptionStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationUsageStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationUsageStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserUsageStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserUsageStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationInactivityStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationInactivityStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserInactivityStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserInactivityStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLastTransaction(chargingStationId: string, connectorId: string): Observable<DataResult<Transaction>> {
    const params: { [param: string]: string } = {};
    params['ChargeBoxID'] = chargingStationId;
    params['ConnectorId'] = connectorId;
    params['Limit'] = '1';
    params['Skip'] = '0';
    params['SortFields'] = 'timestamp';
    params['SortDirs'] = '-1';

    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/ChargingStationTransactions`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationTransactionsStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationTransactionsStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserTransactionsStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserTransactionsStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationPricingStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationPricingStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUserPricingStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserPricingStatistics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCurrentMetrics(): Observable<CurrentMetrics[]> {
    const params: { [param: string]: string } = {};
    params['PeriodInMonth'] = '6';
    // Call
    return this.httpClient.get<CurrentMetrics[]>(`${this.centralRestServerServiceSecuredURL}/CurrentMetrics`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingStation>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargingStation>>(`${this.centralRestServerServiceSecuredURL}/ChargingStations`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCharger(id: string): Observable<ChargingStation> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<ChargingStation>(`${this.centralRestServerServiceSecuredURL}/ChargingStation`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getChargersInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargingStationInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargingStationInError>>(`${this.centralRestServerServiceSecuredURL}/ChargingStationsInError`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSiteUsers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<UserSite>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<UserSite>>(`${this.centralRestServerServiceSecuredURL}/SiteUsers`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUsers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/Users`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUsersInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/UsersInError`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTenants(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Tenant>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Tenant>>(`${this.centralRestServerServiceSecuredURL}/Tenants`,
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
    return this.httpClient.get<Tenant>(`${this.centralRestServerServiceSecuredURL}/Tenant`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsCompleted`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionsToRefund(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsToRefund`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getRefundReports(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<RefundReport>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<RefundReport>>(`${this.centralRestServerServiceSecuredURL}/TransactionsRefundReports`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionsToRefundList(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsToRefundList`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public assignTransactionsToUser(userId: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AssignTransactionsToUser`, null,
      {
        headers: this.buildHttpHeaders(),
        params: { UserID: userId },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getUnassignedTransactionsCount(userId: string): Observable<number> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<number>(`${this.centralRestServerServiceSecuredURL}/UnassignedTransactionsCount`,
      {
        headers: this.buildHttpHeaders(),
        params: { UserID: userId },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransaction(id: string): Observable<Transaction> {
    // Verify init
    this.checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Transaction>(`${this.centralRestServerServiceSecuredURL}/Transaction`,
      {
        headers: this.buildHttpHeaders(),
        params: { ID: id },
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportLogs(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this.checkInit();
    this.getPaging(paging, params);
    this.getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/LoggingsExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this.checkInit();
    this.getPaging(paging, params);
    this.getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/TransactionsExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportTransactionsToRefund(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this.checkInit();
    this.getPaging(paging, params);
    this.getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/TransactionsToRefundExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportStatistics(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this.checkInit();
    this.getPaging(paging, params);
    this.getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/StatisticsExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportChargingStations(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this.checkInit();
    this.getPaging(paging, params);
    this.getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationsExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public exportAllChargingStationsOCCPParams(siteAreaID?: string, siteID?: string): Observable<Blob> {
    // Verify init
    this.checkInit();
    const params: { [param: string]: string } = {};
    if (siteID) {
      params['SiteID'] = siteID;
    }
    if (siteAreaID) {
      params['SiteAreaID'] = siteAreaID;
    }
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationsOCPPParamsExport`,
      {
        headers: this.buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getTransactionsInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<TransactionInError>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<TransactionInError>>(`${this.centralRestServerServiceSecuredURL}/TransactionsInError`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getActiveTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [])
    : Observable<DataResult<Transaction>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsActive`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getOcpiEndpoints(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<OcpiEndpoint>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<OcpiEndpoint>>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpoints`,
      {
        headers: this.buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getConsumptionFromTransaction(transactionId: number, ordering: Ordering[] = []): Observable<Transaction> {
    const params: { [param: string]: string } = {};
    params['TransactionId'] = transactionId.toString();
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<Transaction>(
      `${this.centralRestServerServiceSecuredURL}/ConsumptionFromTransaction`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantCreate`, tenant,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantUpdate`, tenant,
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
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLogs(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Log>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    // Execute
    return this.httpClient.get<DataResult<Log>>(`${this.centralRestServerServiceSecuredURL}/Loggings`,
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
    return this.httpClient.get<Log>(`${this.centralRestServerServiceSecuredURL}/Logging?ID=${id}`,
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
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/UserImage?ID=${id}`,
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
    return this.httpClient.get<User>(`${this.centralRestServerServiceSecuredURL}/User?ID=${id}`,
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
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/UserInvoice?ID=${id}`,
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
    return this.httpClient.get<DataResult<Setting>>(`${this.centralRestServerServiceSecuredURL}/Settings?Identifier=${identifier}&ContentFilter=${contentFilter}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public validateBillingConnection(): Observable<ValidateBillingConnectionResponse> {
    // verify init
    this.checkInit();
    // Execute the REST Service
    return this.httpClient.get<ValidateBillingConnectionResponse>(`${this.centralRestServerServiceSecuredURL}/BillingConnection`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public synchronizeUsersForBilling(): Observable<SynchronizeResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<SynchronizeResponse>(`${this.centralRestServerServiceSecuredURL}/SynchronizeUsersForBilling`, {},
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
    return this.httpClient.get<BillingTax[]>(`${this.centralRestServerServiceSecuredURL}/BillingTaxes`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getRegistrationTokens(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<RegistrationToken>> {
    // Verify init
    this.checkInit();
    // Build Paging
    this.getPaging(paging, params);
    // Build Ordering
    this.getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<RegistrationToken>>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokens`,
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
    return this.httpClient.post<RegistrationToken>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenCreate`, registrationToken,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public revokeRegistrationToken(id: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenRevoke?ID=${id}`,
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
    return this.httpClient.get<EndUserLicenseAgreement>(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
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
    return this.httpClient.post<LoginResponse>(`${this.centralRestServerServiceAuthURL}/Login`, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public refreshToken(): Observable<LoginResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.get<LoginResponse>(`${this.centralRestServerServiceSecuredURL}/UserRefreshToken`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public loginSucceeded(token: string): void {
    // Verify init
    this.checkInit();
    // Keep it local (iFrame use case)
    this.setLoggedUserToken(token, true);
    // Init Socket IO
    if (this.currentUser && !this.configService.getCentralSystemServer().pollEnabled) {
      // @ts-ignore
      this.centralServerNotificationService.initSocketIO(token);
    }
  }

  public setLoggedUserToken(token: string, writeInLocalStorage?: boolean): void {
    // Keep token
    this.currentUserToken = token;
    // @ts-ignore
    this.currentUser = null;
    // Not null?
    if (token) {
      // Decode the token
      this.currentUser = new JwtHelperService().decodeToken(token);
    }
    this.currentUserSubject.next(this.currentUser);
    // Write?
    if (writeInLocalStorage) {
      // Set the token
      this.localStorageService.setItem('token', token);
    }
  }

  public getLoggedUserFromToken(): UserToken {
    // Get the token
    if (!this.currentUser) {
      // Decode the token
      this.localStorageService.getItem('token').subscribe((token) => {
        // Keep it local (iFrame use case)
        this.setLoggedUserToken(token);
      });
    }
    return this.currentUser;
  }

  public getLoggedUserToken(): string {
    // Get the token
    if (!this.currentUserToken) {
      // Decode the token
      this.localStorageService.getItem('token').subscribe((token) => {
        // Keep it local (iFrame use case)
        this.setLoggedUserToken(token);
      });
    }
    return this.currentUserToken;
  }

  public getCurrentUserSubject(): BehaviorSubject<UserToken> {
    return this.currentUserSubject;
  }

  public clearLoggedUserToken(): void {
    // Clear
    // @ts-ignore
    this.currentUserToken = null;
    // @ts-ignore
    this.currentUser = null;
    this.currentUserSubject.next(this.currentUser);
    // Remove from local storage
    this.localStorageService.removeItem('token');
  }

  public isAuthenticated(): boolean {
    // @ts-ignore
    return this.getLoggedUserToken() && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  public logout(): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceAuthURL}/Logout`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public logoutSucceeded(): void {
    this.checkInit();
    this.dialog.closeAll();
    this.clearLoggedUserToken();
    this.centralServerNotificationService.resetSocketIO();
  }

  public getLoggedUser(): UserToken {
    // Verify init
    this.checkInit();
    this.getLoggedUserFromToken();
    // Init Socket IO
    if (!this.configService.getCentralSystemServer().pollEnabled) {
      this.centralServerNotificationService.initSocketIO(this.getLoggedUserToken());
    }
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.currentUser;
  }

  public resetUserPassword(data: any): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    data['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/Reset`, data,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/RegisterUser`, user,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserCreate`, user,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserUpdate`, user,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyCreate`, company,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyUpdate`, company,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createSite(site: Site): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteCreate`, site,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteUpdate`, site,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteDelete?ID=${id}`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaCreate`, siteArea,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaUpdate`, siteArea,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaDelete?ID=${id}`,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SettingUpdate`, setting,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointCreate`, ocpiEndpoint,
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
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointSendEVSEStatuses`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public triggerJobsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPITriggerJobsResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPITriggerJobsResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointTriggerJobs`, ocpiEndpoint,
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
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointSendTokens`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getLocationsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointPullLocations`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getSessionsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointPullSessions`, ocpiEndpoint,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getCdrsOcpiEndpoint(ocpiEndpoint: OcpiEndpoint): Observable<OCPIJobStatusesResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.post<OCPIJobStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointPullCdrs`, ocpiEndpoint,
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
    return this.httpClient.post<OCPIPingResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointPing`, ocpiEndpoint,
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
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointGenerateLocalToken`, ocpiEndpoint,
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
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointUpdate`, ocpiEndpoint,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointDelete?ID=${id}`,
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
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointUnregister?ID=${id}`,
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
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointRegister?ID=${id}`,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public verifyEmail(params: { [param: string]: string | string[]; }): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Set the tenant
    params['Tenant'] = this.windowService.getSubdomain();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(
      `${this.centralRestServerServiceAuthURL}/VerifyEmail`,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/ResendVerificationEmail`, user,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  deleteTransaction(id: number): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  refundTransactions(ids: number[]): Observable<ActionsResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionsRefund`, { transactionIds: ids },
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  synchronizeRefundedTransactions(): Observable<ActionResponse> {
    this.checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SynchronizeRefundedTransactions`, {},
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  softStopTransaction(id: number): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionSoftStop`,
      `{ "ID": "${id}" }`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  chargingStationStopTransaction(chargeBoxId: string, transactionId: number): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        transactionId,
      },
    };
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationRemoteStopTransaction`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  chargingStationStartTransaction(chargeBoxId: string, connectorId: number, tagID: string): Observable<ActionResponse> {
    this.checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        tagID,
        connectorId,
      },
    };
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationRemoteStartTransaction`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  updateChargingStationParams(chargingStation: ChargingStation): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationUpdateParams`, chargingStation,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  updateChargingProfile(chargingProfile: ChargingProfile): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingProfileUpdate`, chargingProfile,
      {
        headers: this.buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  deleteChargingProfile(id: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingProfileDelete?ID=${id}`,
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
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationConfiguration(id: string): Observable<ChargingStationConfiguration> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.get<ChargingStationConfiguration>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConfiguration?ChargeBoxID=${id}`,
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
    const body = `{
      "chargeBoxID": "${id}",
      "args": {
        "key": "${chargerParameter.key}",
        "value": "${chargerParameter.value}"
      }
    }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationChangeConfiguration`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public getChargingStationCompositeSchedule(id: string, connectorId: number, duration: number, unit: string, loadAllConnectors: boolean): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // build request

    const body =
      `{
        "chargeBoxID": "${id}",
        "loadAllConnectors": "${loadAllConnectors}",
        "args": {
          "connectorId": ${connectorId},
          "duration": ${duration},
          "chargingRateUnit": "${unit}"
        }
      }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationGetCompositeSchedule`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationLimitPower(charger: ChargingStation, connectorId?: number, ampLimitValue: number = 0): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationLimitPower`, {
        chargeBoxID: charger.id,
        connectorId,
        ampLimitValue,
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
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationSetChargingProfile`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationClearChargingProfile(charger: ChargingStation, profileId?: string, connectorId?: string, profilePurpose?: string, stackLevel?: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Build default charging profile json
    const date = new Date('01/01/2018').toISOString();
    let body: string;
    body = `{
    "chargeBoxID": "${charger.id}", "args": {`;
    if (profileId) {
      body += `"id": ${profileId}`;
      if (connectorId || profilePurpose || stackLevel) {
        body += `,`;
      }
    }
    if (connectorId) {
      body += `"connectorId": ${connectorId}`;
      if (profilePurpose || stackLevel) {
        body += `,`;
      }
    }
    if (profilePurpose) {
      body += `"chargingProfilePurpose": "${profilePurpose}"`;
      if (stackLevel) {
        body += `,`;
      }
    }
    if (stackLevel) {
      body += `"stackLevel": ${stackLevel}`;
    }
    body += `}
    }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationClearChargingProfile`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public chargingStationUpdateFirmware(charger: ChargingStation, fileName: string): Observable<ActionResponse> {
    // Verify init
    this.checkInit();
    // Execute the REST service
    const date = new Date().toISOString();
    const body = (
      `{
        "chargeBoxID": "${charger.id}",
        "args": {
          "location": "http://download.schneider-electric.com/files?p_enDocType=Software+-+Updates&p_File_Name=R7+3.3.0.10.zip&p_Doc_Ref=MFR4341700",
          "retries": 0,
          "retrieveDate": "${date}",
          "retryInterval": 0
        }
      }`
      // `{
      //   "chargeBoxID": "${charger.id}",
      //   "args": {
      //     "location": "${this.centralRestServerServiceUtilURL}/FirmwareDownload?FileName=${fileName}",
      //     "retries": 0,
      //     "retrieveDate": "${date}",
      //     "retryInterval": 0
      //   }
      // }`
    );
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationUpdateFirmware`, body,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
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

  public requestChargingStationOCPPConfiguration(id: string) {
    // Verify init
    this.checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/ChargingStationRequestConfiguration`,
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
    // Execute
    return this.httpClient.post<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/ChargingStationRequestConfiguration`,
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
    return this.httpClient.get<DataResult<IntegrationConnection>>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnections?userId=${userId}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public createIntegrationConnection(connection: UserConnection) {
    this.checkInit();
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnectionCreate`, connection,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  public deleteIntegrationConnection(userId: string, connectorId: string): Observable<ActionResponse> {
    this.checkInit();
    return this.httpClient.delete<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/IntegrationConnectionDelete?userId=${userId}&connectorId=${connectorId}`,
      {
        headers: this.buildHttpHeaders(),
      })
      .pipe(
        catchError(this.handleHttpError),
      );
  }

  private checkInit(): void {
    // initialized?
    if (!this.initialized) {
      // No: Process the init
      // Get the server config
      this.centralSystemServerConfig = this.configService.getCentralSystemServer();
      // Central Service URL
      this.centralRestServerServiceBaseURL = this.centralSystemServerConfig.protocol + '://' +
        this.centralSystemServerConfig.host + ':' + this.centralSystemServerConfig.port;
      // Set Web Socket URL
      this.centralServerNotificationService.setcentralRestServerServiceURL(this.centralRestServerServiceBaseURL);
      // Auth API
      this.centralRestServerServiceAuthURL = this.centralRestServerServiceBaseURL + '/client/auth';
      // Secured API
      this.centralRestServerServiceSecuredURL = this.centralRestServerServiceBaseURL + '/client/api';
      // Util URL
      this.centralRestServerServiceUtilURL = this.centralRestServerServiceBaseURL + '/client/util';
      // Done
      this.initialized = true;
    }
  }

  private buildHttpHeaders(tenant?: string): HttpHeaders {
    const header = {
      'Content-Type': 'application/json',
    };
    if (tenant !== undefined) {
      // @ts-ignore
      header['Tenant'] = tenant;
    }
    // Check token
    if (this.getLoggedUserToken()) {
      // @ts-ignore
      header['Authorization'] = 'Bearer ' + this.getLoggedUserToken();
    }
    // Build Header
    return new HttpHeaders(header);
  }

  private getSorting(ordering: Ordering[], queryParams: { [param: string]: string | string[]; }) {
    // Check
    if (ordering && ordering.length) {
      const sortFields: String[] = [];
      const sortDirs: String[] = [];
      ordering.forEach((order) => {
        sortFields.push(order.field);
        sortDirs.push(order.direction);
      });
      // @ts-ignore
      queryParams['SortFields'] = sortFields;
      // @ts-ignore
      queryParams['SortDirs'] = sortDirs;
    }
  }

  private getPaging(paging: Paging, queryParams: { [param: string]: string | string[]; }) {
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
    // In a real world app, we might use a remote logging infrastructure
    const errMsg = { status: 0, message: '', details: undefined };
    if (error) {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
      errMsg.details = error.error;
    }
    return throwError(errMsg);
  }
}
