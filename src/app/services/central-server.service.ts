import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, ObservableInput, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ConfigService} from './config.service';
import {TranslateService} from '@ngx-translate/core';
import {Constants} from '../utils/Constants';
import {JwtHelperService} from '@auth0/angular-jwt';
import {LocalStorageService} from './local-storage.service';
import {CentralServerNotificationService} from './central-server-notification.service';
import {
  ActionResponse,
  Charger,
  ChargerInErrorResult,
  ChargerResult,
  Company,
  CompanyResult,
  Image,
  Log,
  Logo,
  LogResult,
  OcpiendpointResult,
  Ordering,
  Paging,
  SettingResult,
  Site,
  SiteArea,
  SiteAreaResult,
  SiteResult,
  Tenant,
  TenantResult,
  Transaction,
  TransactionResult,
  User,
  UserResult
} from '../common.types';
import {WindowService} from './window.service';

@Injectable()
export class CentralServerService {
  private centralRestServerServiceBaseURL: String;
  private centralRestServerServiceSecuredURL: String;
  private centralRestServerServiceAuthURL: String;
  private centralSystemServerConfig;
  private initialized = false;
  private currentUserToken;
  private currentUser;
  private currentUserSubject = new BehaviorSubject<User>(this.currentUser);

  constructor(
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
    private centralServerNotificationService: CentralServerNotificationService,
    private configService: ConfigService,
    private windowService: WindowService) {
    // Default
    this.initialized = false;
  }

  public removeChargersFromSiteArea(siteAreaID, chargerIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveChargingStationsFromSiteArea`,
      {'siteAreaID': siteAreaID, 'chargingStationIDs': chargerIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public addChargersToSiteArea(siteAreaID, chargerIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddChargingStationsToSiteArea`,
      {'siteAreaID': siteAreaID, 'chargingStationIDs': chargerIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public removeUsersFromSite(siteID, userIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveUsersFromSite`,
      {'siteID': siteID, 'userIDs': userIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public addUsersToSite(siteID, userIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddUsersToSite`,
      {'siteID': siteID, 'userIDs': userIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public removeSitesFromUser(userID, siteIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/RemoveSitesFromUser`,
      {'userID': userID, 'siteIDs': siteIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public addSitesToUser(userID, siteIDs) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/AddSitesToUser`,
      {'userID': userID, 'siteIDs': siteIDs},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getCompanies(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<CompanyResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<CompanyResult>(
      `${this.centralRestServerServiceSecuredURL}/Companies`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getCompany(companyId: string, withLogo: boolean = false): Observable<Company> {
    const params: any = [];
    params['ID'] = companyId;
    params['WithLogo'] = withLogo;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Company>(
      `${this.centralRestServerServiceSecuredURL}/Company`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getCompanyLogos(): Observable<Logo[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo[]>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogos`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getCompanyLogo(companyId: String): Observable<Logo> {
    const params: any = [];
    params['ID'] = companyId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Logo>(
      `${this.centralRestServerServiceSecuredURL}/CompanyLogo`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSites(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<SiteResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<SiteResult>(
      `${this.centralRestServerServiceSecuredURL}/Sites`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSite(siteId: string, withImage: boolean = false): Observable<Site> {
    const params: any = [];
    params['ID'] = siteId;
    params['WithImage'] = withImage;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Site>(
      `${this.centralRestServerServiceSecuredURL}/Site`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSiteImage(siteId: String): Observable<Image> {
    const params: any = [];
    params['ID'] = siteId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteImage`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSiteAreas(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<SiteAreaResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<SiteResult>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreas`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSiteArea(siteAreaId: string, withChargeBoxes: boolean = false, withSite: boolean = false): Observable<SiteArea> {
    const params: any = [];
    params['ID'] = siteAreaId;
    params['WithChargeBoxes'] = withChargeBoxes;
    params['WithSite'] = withSite;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<SiteArea>(
      `${this.centralRestServerServiceSecuredURL}/SiteArea`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSiteAreaImage(siteAreaId: String): Observable<Image> {
    const params: any = [];
    params['ID'] = siteAreaId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(
      `${this.centralRestServerServiceSecuredURL}/SiteAreaImage`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getConsumptionStatistics(year): Observable<any> {
    const params: any = [];
    params['Year'] = year;
    // Call
    return this.httpClient.get<any>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionStatistics`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getCurrentMetrics(): Observable<any> {
    const params: any = [];
    params['PeriodInMonth'] = 6;
    // Call
    return this.httpClient.get<any>(`${this.centralRestServerServiceSecuredURL}/CurrentMetrics`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getChargers(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<ChargerResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStations`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  // tslint:disable-next-line:max-line-length
  public getChargersInError(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<ChargerInErrorResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationsInError`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getUsers(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<UserResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/Users`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getUsersInError(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<UserResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/UsersInError`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getTenants(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<TenantResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<TenantResult>(`${this.centralRestServerServiceSecuredURL}/Tenants`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getTransactions(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<TransactionResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<TransactionResult>(`${this.centralRestServerServiceSecuredURL}/TransactionsCompleted`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public exportLogs(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<any> {
    this._checkInit();
    this._buildPaging(paging, params);
    this._buildOrdering(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/LoggingsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public exportTransactions(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<any> {
    this._checkInit();
    this._buildPaging(paging, params);
    this._buildOrdering(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/TransactionsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public exportChargingStations(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<any> {
    this._checkInit();
    this._buildPaging(paging, params);
    this._buildOrdering(ordering, params);
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationsExport`,
      {
        headers: this._buildHttpHeaders(),
        responseType: 'blob',
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getTransactionsInError(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [])
    : Observable<TransactionResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<TransactionResult>(`${this.centralRestServerServiceSecuredURL}/TransactionsInError`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getActiveTransactions(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = [])
    : Observable<TransactionResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get<TransactionResult>(`${this.centralRestServerServiceSecuredURL}/TransactionsActive`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  // tslint:disable-next-line:max-line-length
  public getOcpiEndpoints(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<OcpiendpointResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/Ocpiendpoints`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getChargingStationConsumptionFromTransaction(transactionId: number, ordering: Ordering[] = []): Observable<Transaction> {
    const params: any = [];
    params['TransactionId'] = transactionId;
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Transaction>(
      `${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionFromTransaction`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createTenant(tenant: Tenant) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantCreate`, tenant,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateTenant(tenant: Tenant) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantUpdate`, tenant,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteTenant(id): Observable<ActionResponse> {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TenantDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public verifyTenant(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.get(`${this.centralRestServerServiceAuthURL}/VerifyTenant`,
      {
        headers: this._buildHttpHeaders(this.windowService.getSubdomain())
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getLogs(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<LogResult> {
    // Verify init
    this._checkInit();
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Execute the REST service
    // Execute
    return this.httpClient.get<LogResult>(`${this.centralRestServerServiceSecuredURL}/Loggings`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getLog(id): Observable<Log> {
    // Verify init
    this._checkInit();
    // Call
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/Logging?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getUserImage(id: string): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/UserImage?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getUser(id: string): Observable<User> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<User>(`${this.centralRestServerServiceSecuredURL}/User?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getSettings(identifier: string): Observable<SettingResult> {
    // verify init
    this._checkInit();
    // Execute the REST Service
    return this.httpClient.get<SettingResult>(`${this.centralRestServerServiceSecuredURL}/Settings?Identifier=${identifier}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getEndUserLicenseAgreement(language: string) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`,
      {
        headers: this._buildHttpHeaders(this.windowService.getSubdomain())
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public login(user): Observable<any> {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceAuthURL}/Login`, user,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public loggingSucceeded(token) {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.setLoggedUserToken(token, true);
    // Init Socket IO
    this.centralServerNotificationService.initSocketIO(this.currentUser.tenantID);
    // Set Language
    this.translateService.use(this.getLoggedUser().language);
  }

  public setLoggedUserToken(token: string, writeInLocalStorage?: boolean) {
    // Keep token
    this.currentUserToken = token;
    this.currentUser = null;
    // Not null?
    if (token) {
      // Decode the token
      this.currentUser = new JwtHelperService().decodeToken(token);
      this.currentUserSubject.next(this.currentUser);
    }
    // Write?
    if (writeInLocalStorage) {
      // Set the token
      this.localStorageService.setItem('token', token);
    }
  }

  public getLoggedUserFromToken(): User {
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

  public getCurrentUserSubject(): BehaviorSubject<User> {
    return this.currentUserSubject;
  }

  public clearLoggedUserToken() {
    // Clear
    this.currentUserToken = null;
    this.currentUser = null;
    this.currentUserSubject.next(this.currentUser);
    // Remove from local storage
    this.localStorageService.removeItem('token');
  }

  public isAuthenticated(): boolean {
    return this.getLoggedUserToken() != null && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  public logout(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceAuthURL}/Logout`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public logoutSucceeded() {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.clearLoggedUserToken();
    // Disconnect
    this.centralServerNotificationService.resetSocketIO();
  }

  public getLoggedUser(): User {
    // Verify init
    this._checkInit();
    this.getLoggedUserFromToken();
    // Init Socket IO
    this.centralServerNotificationService.initSocketIO(this.currentUser.tenantID);
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.currentUser;
  }

  public isComponentActive(componentName): boolean {
    // get logged user
    const activeComponents = this.getLoggedUser().activeComponents;
    if (activeComponents) {
      return this.getLoggedUser().activeComponents.includes(componentName);
    } else {
      return false;
    }
  }

  public getActiveComponents(): string[] {
    return this.getLoggedUser().activeComponents;
  }

  public resetUserPassword(data) {
    // Verify init
    this._checkInit();
    // Set the tenant
    data['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceAuthURL}/Reset`, data,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public registerUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/RegisterUser`, user,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserCreate`, user,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserUpdate`, user,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createCompany(company): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyCreate`, company,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateCompany(company): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyUpdate`, company,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteCompany(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/CompanyDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteCreate`, site,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteUpdate`, site,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteSite(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaCreate`, siteArea,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaUpdate`, siteArea,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteSiteArea(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SiteAreaDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createSetting(setting): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SettingCreate`, setting,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateSetting(setting): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/SettingUpdate`, setting,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createOcpiendpoint(ocpiendpoint): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiendpointCreate`, ocpiendpoint,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public sendEVSEStatusesOcpiendpoint(ocpiendpoint) {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceSecuredURL}/OcpiendpointSendEVSEStatuses`, ocpiendpoint,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public pingOcpiendpoint(ocpiendpoint) {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceSecuredURL}/OcpiendpointPing`, ocpiendpoint,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public generateLocalTokenOcpiendpoint(ocpiendpoint) {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceSecuredURL}/OcpiendpointGenerateLocalToken`, ocpiendpoint,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public updateOcpiendpoint(ocpiendpoint): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiendpointUpdate`, ocpiendpoint,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteOcpiendpoint(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiendpointDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public registerOcpiendpoint(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/OcpiendpointRegister?ID=${id}`,
      `{ "id": "${id}" }`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteUser(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public verifyEmail(params: any) {
    // Verify init
    this._checkInit();
    // Set the tenant
    params['tenant'] = this.windowService.getSubdomain();
    // Execute the REST service
    return this.httpClient.get(
      `${this.centralRestServerServiceAuthURL}/VerifyEmail`,
      {
        headers: this._buildHttpHeaders(),
        params
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public resendVerificationEmail(user) {
    // Verify init
    this._checkInit();
    // Set the tenant
    user['tenant'] = this.windowService.getSubdomain();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceAuthURL}/ResendVerificationEmail`, user,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  deleteTransaction(id: number) {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  refundTransactions(ids: number[]) {
    this._checkInit();
    // Execute the REST service
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/TransactionsRefund`, {transactionIds: ids},
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  softStopTransaction(id: number) {
    this._checkInit();
    return this.httpClient.put(`${this.centralRestServerServiceSecuredURL}/TransactionSoftStop`,
      `{ "transactionId": "${id}" }`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  stationStopTransaction(chargeBoxId: string, transactionId: number) {
    this._checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        transactionId: transactionId
      }
    };
    return this.httpClient.post(`${this.centralRestServerServiceSecuredURL}/ChargingStationStopTransaction`, body,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  stationStartTransaction(chargeBoxId: string, connectorID: number, tagID: string) {
    this._checkInit();
    const body = {
      chargeBoxID: chargeBoxId,
      args: {
        tagID: tagID,
        connectorID: connectorID
      }
    };
    return this.httpClient.post(`${this.centralRestServerServiceSecuredURL}/ChargingStationStartTransaction`, body,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  updateChargingStationParams(chargingStation: Charger): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put(`${this.centralRestServerServiceSecuredURL}/ChargingStationUpdateParams`, chargingStation,
      {
        headers: this._buildHttpHeaders(this.windowService.getSubdomain())
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public deleteChargingStation(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationDelete?ID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getChargingStationConfiguration(id): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationConfiguration?ChargeBoxID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  /**
   * updateChargingStationOCPPConfiguration
   */
  public updateChargingStationOCPPConfiguration(id, chargerParameter) {
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
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getChargingStationCompositeSchedule(id, connectorId, duration, unit, loadAllConnectors) {
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
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public chargingStationLimitPower(charger: Charger, connectorId, unit, powerValue: number, stackLevel: number) {
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
    //console.log(body);
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationSetChargingProfile`, body,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public chargingStationSetChargingProfile(charger: Charger, connectorId, chargingProfile) {
    // Verify init
    this._checkInit();
    // Build default charging profile json
    const date = new Date('01/01/2018').toISOString();
    let body: string;
    body = `{
      "chargeBoxID": "${charger.id}",
      "args": {
        "connectorId": 0,
        "csChargingProfiles": ${JSON.stringify(chargingProfile)}
      }
    }`;
    //console.log(body);
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationSetChargingProfile`, body,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public chargingStationClearChargingProfile(charger: Charger, profileId?, connectorId?, profilePurpose?, stackLevel?) {
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

    //console.log(body);
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/ChargingStationClearChargingProfile`, body,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  /**
   *
   */
  public actionChargingStation(action, id, args) {
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
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  /**
   * getChargingStationOCPPConfiguration
   */
  public getChargingStationOCPPConfiguration(id) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.get<ActionResponse>(
      `${this.centralRestServerServiceSecuredURL}/ChargingStationRequestConfiguration?ChargeBoxID=${id}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  /**
   * getIsAuthorized
   */
  public getIsAuthorized(action, arg1, arg2?) {
    // Verify init
    this._checkInit();
    // Build parameters
    const filters = [];
    let queryString;
    // Set Action
    filters.push(`Action=${action}`);
    // Set Args
    if (arg1) {
      filters.push(`Arg1=${arg1}`);
    }
    if (arg2) {
      filters.push(`Arg2=${arg2}`);
    }
    // Build the query string
    queryString = filters.join('&');
    // Execute
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/IsAuthorized?${queryString}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public getIntegrationConnections(userId: string) {
    this._checkInit();
    return this.httpClient.get<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnections?userId=${userId}`,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  public createIntegrationConnection(payload: any) {
    this._checkInit();
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/IntegrationConnectionCreate`, payload,
      {
        headers: this._buildHttpHeaders()
      })
      .pipe(
        catchError(this._handleHttpError)
      );
  }

  private _checkInit() {
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

  private _buildHttpHeaders(tenant?: String) {
    const header = {
      'Content-Type': 'application/json'
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

  private _buildOrdering(ordering: Ordering[], queryString: any) {
    // Check
    if (ordering && ordering.length) {
      if (!queryString['SortFields']) {
        queryString['SortFields'] = [];
        queryString['SortDirs'] = [];
      }
      // Set
      ordering.forEach((order) => {
        queryString['SortFields'].push(order.field);
        queryString['SortDirs'].push(order.direction);
      });
    }
  }

  private _buildPaging(paging: Paging, queryString: any) {
    // Limit
    if (paging.limit) {
      queryString['Limit'] = paging.limit;
    }
    // Skip
    if (paging.skip) {
      queryString['Skip'] = paging.skip;
    }
  }

  private _handleHttpError(error: HttpErrorResponse, caught: Observable<any>): ObservableInput<{}> {
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
