import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TranslateService } from '@ngx-translate/core';
import { throwError, BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ActionResponse, Charger, ChargerConfiguration, ChargerInError, Company, CurrentMetrics, DataResult, EndUserLicenseAgreement, Image, IntegrationConnection, Log, LoginResponse, Logo, OcpiEndpoint, Ordering, OCPIEVSEStatusesResponse, OCPIGenerateLocalTokenResponse, OCPIPingResponse, Paging, RegistrationToken, Setting, Site, SiteArea, SiteUser, StatisticData, SynchronizeResponse, Tenant, Transaction, User, UserConnection, UserSite, UserToken, ValidateBillingConnectionResponse } from '../common.types';
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
  private centralSystemServerConfig;
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
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveChargingStationsFromSiteArea`,
      {siteAreaID, chargingStationIDs: chargerIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public addChargersToSiteArea(siteAreaID: string, chargerIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddChargingStationsToSiteArea`,
      {siteAreaID, chargingStationIDs: chargerIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public removeUsersFromSite(siteID: string, userIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveUsersFromSite`,
      {siteID, userIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public addUsersToSite(siteID: string, userIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddUsersToSite`,
      {siteID, userIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateSiteUserAdmin(siteID: string, userID: string, siteAdmin: boolean): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteUserAdmin`,
      {siteID, userID, siteAdmin},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateSiteOwner(siteID: string, userID: string): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteOwner`,
      {siteID, userID},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public removeSitesFromUser(userID: string, siteIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveSitesFromUser`,
      {userID, siteIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public addSitesToUser(userID: string, siteIDs: string[]): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddSitesToUser`,
      {userID, siteIDs},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCompanies(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Company>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Company>>(
      `${this.centralRestServerServiceSecuredURL}/Companies`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCompany(companyId: string, withLogo: boolean = false): Observable<Company> {
    const params: { [param: string]: string } = {};
    params['ID'] = companyId;
    params['WithLogo'] = withLogo.toString();
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Company>(
      `${this.centralRestServerServiceSecuredURL}/Company`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCompanyLogos(): Observable<Logo[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo[]>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogos`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCompanyLogo(companyId: string): Observable<Logo> {
    const params: { [param: string]: string } = {};
    params['ID'] = companyId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogo`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserSites(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteUser>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteUser>>(`${this.centralRestServerServiceSecuredURL}/UserSites`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSites(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Site>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Site>>(
      `${this.centralRestServerServiceSecuredURL}/Sites`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSite(siteId: string, withImage: boolean = false): Observable<Site> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteId;
    params['WithImage'] = withImage.toString();
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Site>(
      `${this.centralRestServerServiceSecuredURL}/Site`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSiteImage(siteId: string): Observable<Image> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteImage`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSiteAreas(params: { [param: string]: string | string[]; } = {},
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<SiteArea>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<SiteArea>>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreas`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSiteArea(siteAreaId: string): Observable<SiteArea> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteAreaId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteArea>(
      `${this.centralRestServerServiceSecuredURL}/SiteArea`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSiteAreaImage(siteAreaId: string): Observable<Image> {
    const params: { [param: string]: string } = {};
    params['ID'] = siteAreaId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreaImage`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransactionYears(): Observable<number[]> {
    const params: { [param: string]: string } = {};
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<number[]>(`${this.centralRestServerServiceSecuredURL}/TransactionYears`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationConsumptionStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserConsumptionStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserConsumptionStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationUsageStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationUsageStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserUsageStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserUsageStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationInactivityStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationInactivityStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserInactivityStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserInactivityStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
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

    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/ChargingStationTransactions`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationTransactionsStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationTransactionsStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserTransactionsStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserTransactionsStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationPricingStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/ChargingStationPricingStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserPricingStatistics(year: number,
    params: { [param: string]: string | string[]; } = {}): Observable<StatisticData[]> {
    params['Year'] = year + '';
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<StatisticData[]>(`${this.centralRestServerServiceSecuredURL}/UserPricingStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCurrentMetrics(): Observable<CurrentMetrics[]> {
    const params: { [param: string]: string } = {};
    params['PeriodInMonth'] = '6';
    // Call
    return this.httpClient.get<CurrentMetrics[]>(`${this.centralRestServerServiceSecuredURL}/CurrentMetrics`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Charger>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Charger>>(`${this.centralRestServerServiceSecuredURL}/ChargingStations`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getCharger(id: string): Observable<Charger> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Charger>(`${this.centralRestServerServiceSecuredURL}/ChargingStation`,
      {
        headers: this._buildHttpHeaders(),
        params: {ID: id},
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getChargersInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<ChargerInError>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<ChargerInError>>(`${this.centralRestServerServiceSecuredURL}/ChargingStationsInError`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSiteUsers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<UserSite>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<UserSite>>(`${this.centralRestServerServiceSecuredURL}/SiteUsers`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUsers(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/Users`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUsersInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<User>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<User>>(`${this.centralRestServerServiceSecuredURL}/UsersInError`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTenants(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Tenant>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Tenant>>(`${this.centralRestServerServiceSecuredURL}/Tenants`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTenant(id: string): Observable<Tenant> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Tenant>(`${this.centralRestServerServiceSecuredURL}/Tenant`,
      {
        headers: this._buildHttpHeaders(),
        params: {ID: id},
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsCompleted`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransactionsToRefund(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsToRefund`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getRefundReports(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsRefundReports`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransactionsToRefundList(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsToRefundList`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public assignTransactionsToUser(userId: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AssignTransactionsToUser`, null,
      {
        headers: this._buildHttpHeaders(),
        params: {UserID: userId},
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUnassignedTransactionsCount(userId: string): Observable<number> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<number>(`${this.centralRestServerServiceSecuredURL}/UnassignedTransactionsCount`,
      {
        headers: this._buildHttpHeaders(),
        params: {UserID: userId},
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransaction(id: string): Observable<Transaction> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<Transaction>(`${this.centralRestServerServiceSecuredURL}/Transaction`,
      {
        headers: this._buildHttpHeaders(),
        params: {ID: id},
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public exportLogs(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this._checkInit();
    this._getPaging(paging, params);
    this._getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/LoggingsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public exportTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this._checkInit();
    this._getPaging(paging, params);
    this._getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/TransactionsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public exportStatistics(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this._checkInit();
    this._getPaging(paging, params);
    this._getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/StatisticsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public exportChargingStations(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Blob> {
    this._checkInit();
    this._getPaging(paging, params);
    this._getSorting(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getTransactionsInError(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsInError`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getActiveTransactions(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [])
    : Observable<DataResult<Transaction>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<Transaction>>(`${this.centralRestServerServiceSecuredURL}/TransactionsActive`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  // tslint:disable-next-line:max-line-length
  public getOcpiEndpoints(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<OcpiEndpoint>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<OcpiEndpoint>>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpoints`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getConsumptionFromTransaction(transactionId: number, ordering: Ordering[] = []): Observable<Transaction> {
    const params: { [param: string]: string } = {};
    params['TransactionId'] = transactionId.toString();
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Transaction>(
      `${this.centralRestServerServiceSecuredURL}/ConsumptionFromTransaction`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createTenant(tenant: Tenant): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantCreate`, tenant,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateTenant(tenant: Tenant): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantUpdate`, tenant,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteTenant(id: string): Observable<ActionResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getLogs(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<Log>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    // Execute
    return this.httpClient.get<DataResult<Log>>(`${this.centralRestServerServiceSecuredURL}/Loggings`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getLog(id: string): Observable<Log> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Call
    return this.httpClient.get<Log>(`${this.centralRestServerServiceSecuredURL}/Logging?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserImage(id: string): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    if (!id) {
      return EMPTY;
    }
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/UserImage?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUser(id: string): Observable<User> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get<User>(`${this.centralRestServerServiceSecuredURL}/User?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getUserInvoice(id: string): Observable<Blob> {
    // Verify init
    this._checkInit();
    if (!id) {
      return EMPTY;
    }
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/UserInvoice?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getSettings(identifier: string, contentFilter = false): Observable<DataResult<Setting>> {
    // verify init
    this._checkInit();
    // Execute the REST Service
    return this.httpClient.get<DataResult<Setting>>(`${this.centralRestServerServiceSecuredURL}/Settings?Identifier=${identifier}&ContentFilter=${contentFilter}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public validateBillingConnection(): Observable<ValidateBillingConnectionResponse> {
    // verify init
    this._checkInit();
    // Execute the REST Service
    return this.httpClient.get<ValidateBillingConnectionResponse>(`${this.centralRestServerServiceSecuredURL}/BillingConnection`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public SynchronizeUsersForBilling(): Observable<SynchronizeResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<SynchronizeResponse>(`${this.centralRestServerServiceSecuredURL}/SynchronizeUsersForBilling`, {},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getRegistrationTokens(params: { [param: string]: string | string[]; },
    paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<DataResult<RegistrationToken>> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._getPaging(paging, params);
    // Build Ordering
    this._getSorting(ordering, params);
    // Execute the REST service
    return this.httpClient.get<DataResult<RegistrationToken>>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokens`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createRegistrationToken(registrationToken: Partial<RegistrationToken> = {}): Observable<RegistrationToken> {
    this._checkInit();
    return this.httpClient.post<RegistrationToken>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenCreate`, registrationToken,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteRegistrationToken(id: string): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public revokeRegistrationToken(id: string): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RegistrationTokenRevoke?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getEndUserLicenseAgreement(language: string): Observable<EndUserLicenseAgreement> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<EndUserLicenseAgreement>(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`,
      {
        headers: this._buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public login(user: any): Observable<LoginResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<LoginResponse>(`${this.centralRestServerServiceAuthURL}/Login`, user,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public loggingSucceeded(token: string): void {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.setLoggedUserToken(token, true);
    // Init Socket IO
    if (this.currentUser && !this.configService.getCentralSystemServer().pollEnabled) {
      this.centralServerNotificationService.initSocketIO(this.currentUser['']);
    }
  }

  public setLoggedUserToken(token: string, writeInLocalStorage?: boolean): void {
    // Keep token
    this.currentUserToken = token;
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
    this.currentUserToken = null;
    this.currentUser = null;
    this.currentUserSubject.next(this.currentUser);
    // Remove from local storage
    this.localStorageService.removeItem('token');
  }

  public isAuthenticated(): boolean {
    return this.getLoggedUserToken() && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  public logout(): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceAuthURL}/Logout`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public logoutSucceeded(): void {
    this._checkInit();
    this.dialog.closeAll();
    this.clearLoggedUserToken();
    this.centralServerNotificationService.resetSocketIO();
  }

  public getLoggedUser(): UserToken {
    // Verify init
    this._checkInit();
    this.getLoggedUserFromToken();
    // Init Socket IO
    if (!this.configService.getCentralSystemServer().pollEnabled) {
      this.centralServerNotificationService.initSocketIO(this.currentUser.tenantID);
    }
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.currentUser;
  }

  public resetUserPassword(data): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    data['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/Reset`, data,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public registerUser(user: any): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/RegisterUser`, user,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createUser(user: any): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserCreate`, user,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserUpdate`, user,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createCompany(company: any): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyCreate`, company,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateCompany(company: any): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyUpdate`, company,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteCompany(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteCreate`, site,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteUpdate`, site,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteSite(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createSiteArea(siteArea: SiteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaCreate`, siteArea,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateSiteArea(siteArea: SiteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaUpdate`, siteArea,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteSiteArea(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateSetting(setting): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SettingUpdate`, setting,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createOcpiEndpoint(ocpiEndpoint): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointCreate`, ocpiEndpoint,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public sendEVSEStatusesOcpiEndpoint(ocpiEndpoint): Observable<OCPIEVSEStatusesResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<OCPIEVSEStatusesResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointSendEVSEStatuses`, ocpiEndpoint,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public pingOcpiEndpoint(ocpiEndpoint): Observable<OCPIPingResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<OCPIPingResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointPing`, ocpiEndpoint,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public generateLocalTokenOcpiEndpoint(ocpiEndpoint): Observable<OCPIGenerateLocalTokenResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<OCPIGenerateLocalTokenResponse>(
      `${this.centralRestServerServiceSecuredURL}/OcpiEndpointGenerateLocalToken`, ocpiEndpoint,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public updateOcpiEndpoint(ocpiEndpoint): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointUpdate`, ocpiEndpoint,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteOcpiEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public registerOcpiEndpoint(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiEndpointRegister?ID=${id}`,
      `{ "id": "${id}" }`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteUser(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public verifyEmail(params: { [param: string]: string | string[]; }): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    params['tenant'] = this.windowService.getSubdomain();
    // Execute the REST service
    return this.httpClient.get<ActionResponse>(
      `${this.centralRestServerServiceAuthURL}/VerifyEmail`,
      {
        headers: this._buildHttpHeaders(),
        params,
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public resendVerificationEmail(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/ResendVerificationEmail`, user,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  deleteTransaction(id: number): Observable<ActionResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  refundTransactions(ids: number[]): Observable<ActionResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionsRefund`, {transactionIds: ids},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  synchronizeRefundedTransactions(): Observable<ActionResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SynchronizeRefundedTransactions`, {},
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  softStopTransaction(id: number): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionSoftStop`,
      `{ "ID": "${id}" }`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  chargingStationStopTransaction(chargeBoxId: string, transactionId: number): Observable<ActionResponse> {
    this._checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        transactionId,
      },
    };
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationRemoteStopTransaction`, body,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  chargingStationStartTransaction(chargeBoxId: string, connectorID: number, tagID: string): Observable<ActionResponse> {
    this._checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        tagID,
        connectorID,
      },
    };
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationRemoteStartTransaction`, body,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  updateChargingStationParams(chargingStation: Charger): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationUpdateParams`, chargingStation,
      {
        headers: this._buildHttpHeaders(this.windowService.getSubdomain()),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteChargingStation(id: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationConfiguration(id: string): Observable<ChargerConfiguration> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.get<ChargerConfiguration>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConfiguration?ChargeBoxID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  /**
   * updateChargingStationOCPPConfiguration
   */
  public updateChargingStationOCPPConfiguration(id, chargerParameter): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
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
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getChargingStationCompositeSchedule(id, connectorId, duration, unit, loadAllConnectors): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
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
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public chargingStationLimitPower(charger: Charger, connectorId, unit, powerValue: number, stackLevel: number): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Build default charging profile json
    const date = new Date('01/01/2018').toISOString();
    let body: string;
    body = `{
      "chargeBoxID": "${charger.id}",
      "args": {
        "connectorId": 0,
        "csChargingProfiles": {
          "chargingProfileId": 1,
          "stackLevel": ${stackLevel},
          "chargingProfilePurpose": "TxDefaultProfile",
          "chargingProfileKind": "Relative",
          "chargingSchedule": {
            "chargingRateUnit": "${unit}",
            "chargingSchedulePeriod": [{
              "startPeriod": 0,
              "limit": ${powerValue}
            }
          ]
          }
        }
      }
    }`;
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationSetChargingProfile`, body,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public chargingStationSetChargingProfile(charger: Charger, connectorId, chargingProfile): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
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
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public chargingStationClearChargingProfile(charger: Charger, profileId?: string, connectorId?: string, profilePurpose?: string, stackLevel?: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
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
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  /**
   *
   */
  public actionChargingStation(action: string, id: string, args: string): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
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
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  /**
   * getChargingStationOCPPConfiguration
   */
  public getChargingStationOCPPConfiguration(id: string) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.get<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/ChargingStationRequestConfiguration?ChargeBoxID=${id}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public getIntegrationConnections(userId: string): Observable<DataResult<IntegrationConnection>> {
    this._checkInit();
    return this.httpClient.get<DataResult<IntegrationConnection>>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnections?userId=${userId}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public createIntegrationConnection(connection: UserConnection) {
    this._checkInit();
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnectionCreate`, connection,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  public deleteIntegrationConnection(userId: string, connectorId: string): Observable<ActionResponse> {
    this._checkInit();
    return this.httpClient.delete<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/IntegrationConnectionDelete?userId=${userId}&connectorId=${connectorId}`,
      {
        headers: this._buildHttpHeaders(),
      })
      .pipe(
        catchError(this._handleHttpError),
      );
  }

  private _checkInit(): void {
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
      // Done
      this.initialized = true;
    }
  }

  private _buildHttpHeaders(tenant?: string): HttpHeaders {
    const header = {
      'Content-Type': 'application/json',
    };

    if (tenant !== undefined) {
      header['Tenant'] = tenant;
    }

    // Check token
    if (this.getLoggedUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getLoggedUserToken();
    }
    // Build Header
    return new HttpHeaders(header);
  }

  private _getSorting(ordering: Ordering[], queryParams: { [param: string]: string | string[]; }) {
    // Check
    if (ordering && ordering.length) {
      const sortFields = [];
      const sortDirs = [];
      ordering.forEach((order) => {
        sortFields.push(order.field);
        sortDirs.push(order.direction);
      });
      // Set
      queryParams['SortFields'] = sortFields;
      queryParams['SortDirs'] = sortDirs;
    }
  }

  private _getPaging(paging: Paging, queryParams: { [param: string]: string | string[]; }) {
    // Limit
    if (paging.limit) {
      queryParams['Limit'] = paging.limit.toString();
    }
    // Skip
    if (paging.skip) {
      queryParams['Skip'] = paging.skip.toString();
    }
  }

  private _handleHttpError(error: HttpErrorResponse): Observable<never> {
    // In a real world app, we might use a remote logging infrastructure
    const errMsg = {status: 0, message: '', details: undefined};
    if (error) {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
      errMsg.details = error.error;
    }
    return throwError(errMsg);
  }
}
