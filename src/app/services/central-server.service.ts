import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, ObservableInput, of, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ConfigService} from './config.service';
import {TranslateService} from '@ngx-translate/core';
import {Constants} from '../utils/Constants';
import {JwtHelperService} from '@auth0/angular-jwt';
import {LocalStorageService} from './local-storage.service';
import {CentralServerNotificationService} from './central-server-notification.service';
import {
  ActionResponse,
  ChargerResult,
  Image,
  Log,
  LogResult,
  Ordering,
  Paging,
  RouteInfo,
  SiteResult,
  Tenant,
  TenantResult,
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
  private routesTranslated: RouteInfo[];
  private routes: RouteInfo[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      title: 'Dashboard',
      type: 'link',
      icontype: 'dashboard'
    },
    {
      id: 'charging_stations',
      path: '/charging-stations',
      title: 'Charging Stations',
      type: 'link',
      icontype: 'ev_station',
      admin: true
    },
    {
      id: 'users',
      path: '/users',
      title: 'Users',
      type: 'link',
      icontype: 'people',
      admin: true,
      superAdmin: true
    },
    {
      id: 'tenants',
      path: '/tenants',
      title: 'Tenants',
      type: 'link',
      icontype: 'account_balance',
      superAdmin: true
    },
    {
      id: 'transactions',
      path: '/transactions',
      title: 'Transactions',
      type: 'link',
      icontype: 'network_check',
      admin: true
    },
    {
      id: 'logs',
      path: '/logs',
      title: 'Logs',
      type: 'link',
      icontype: 'list',
      admin: true,
      superAdmin: true
    }
  ];

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

  public getRoutes(): Observable<RouteInfo[]> {
    // Already translated
    if (!this.routesTranslated) {
      // Filter
      const filteredRoutes = this.routes.filter((route: RouteInfo) => {
        switch (this.getLoggedUser().role) {
          case Constants.ROLE_SUPER_ADMIN:
            if (route.superAdmin || !route.admin) {
              return true;
            }
            break;
          case Constants.ROLE_ADMIN:
            if (route.admin || !route.superAdmin) {
              return true;
            }
            break;
          case Constants.ROLE_BASIC:
          case Constants.ROLE_DEMO:
          default:
            if (!route.admin && !route.superAdmin) {
              return true;
            }
        }
        return false;
      });
      // No: translate
      this.routesTranslated = filteredRoutes.map((route) => {
        // Translate
        route.title = this.translateService.instant(`general.menu.${route.id}`);
        // Return
        return route;
      });
    }
    // Menu Items
    return of(this.routesTranslated);
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

  public getActiveTransactions(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<TransactionResult> {
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
    this.routesTranslated = null;
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

  getChargerConnectorTypes() {
    // Return
    return [
      {key: 'T2', description: 'Type 2', image: 'assets/img/connectors/type2.gif'},
      {key: 'CCS', description: 'Combo (CCS)', image: 'assets/img/connectors/combo_ccs.gif'},
      {key: 'C', description: 'CHAdeMO', image: 'assets/img/connectors/chademo.gif'}
    ];
  }

  getChargerConnectorTypeByKey(type) {
    // Return the found key
    const foundConnectorType = this.getChargerConnectorTypes().find(
      (connectorType) => connectorType.key === type);
    return (foundConnectorType ? foundConnectorType :
        {
          key: 'U',
          description: this.translateService.instant('chargers.connector_unknown'),
          image: 'assets/img/connectors/no-connector.gif'
        }
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

  private _handleHttpError(error: any, caught: Observable<any>): ObservableInput<{}> {
    // In a real world app, we might use a remote logging infrastructure
    const errMsg = {status: 0, message: '', details: undefined};
    if (error instanceof Response) {
      errMsg.status = error.status;
      errMsg.message = error.text();
    } else {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
      errMsg.details = error.error;
    }
    return throwError(errMsg);
  }
}
