import { Injectable } from '@angular/core';
import { Response, Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ObservableInput } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { throwError, of } from 'rxjs';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../utils/Constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from './local-storage.service';
import { CentralServerNotificationService } from './central-server-notification.service';
import { ActionResponse, Ordering, Paging, SiteResult, Log, LogResult, Image, User, Status, Role, RouteInfo } from '../common.types';

@Injectable()
export class CentralServerService {
    private centralRestServerServiceBaseURL: String;
    private centralRestServerServiceSecuredURL: String;
    private centralRestServerServiceAuthURL: String;
    private centralSystemServerConfig;
    private initialized = false;
    private currentUserToken;
    private currentUser;

  constructor(
      private httpClient: HttpClient,
      private translateService: TranslateService,
      private localStorageService: LocalStorageService,
      private centralServerNotificationService: CentralServerNotificationService,
      private configService: ConfigService) {
    // Default
    this.initialized = false;
  }

  _checkInit() {
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

  getRoutes(): Observable<RouteInfo[]> {
    // Menu Items
    return of([
      {
        id: 'dashboard',
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'dashboard'
    },
    {
        id: 'logs',
        path: '/logs',
        title: 'Logs',
        type: 'link',
        icontype: 'list'
      }
    ]);
  }

  buildHeaders() {
    const header = {
      'Content-Type': 'application/json',
    };
    // Check token
    if (this.getLoggedUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getLoggedUserToken();
    }
    // Build Header
    return new Headers(header);
  }

  buildHttpHeaders() {
    const header = {
      'Content-Type': 'application/json',
    };
    // Check token
    if (this.getLoggedUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getLoggedUserToken();
    }
    // Build Header
    return new HttpHeaders(header);
  }

  buildOrdering(ordering: Ordering[], queryString: any) {
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

  buildPaging(paging: Paging, queryString: any) {
    // Limit
    if (paging.limit) {
      queryString['Limit'] = paging.limit;
    }
    // Skip
    if (paging.skip) {
      queryString['Skip'] = paging.skip;
    }
  }

  getSites(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<SiteResult> {
    // Verify init
    this._checkInit();
    // Set filter
    const queryString = {};
    // Set Values
    if (params.search) {
      queryString['Search'] = params.search;
    }
    if (params.userID) {
      queryString['UserID'] = params.userID;
    }
    // Site Areas
    if (params.withSiteAreas) {
      queryString['WithSiteAreas'] = params.withSiteAreas;
    }
    // Company
    if (params.withCompany) {
      queryString['WithCompany'] = params.withCompany;
    }
    // Charge Boxes
    if (params.withChargeBoxes) {
      queryString['WithChargeBoxes'] = params.withChargeBoxes;
    }
    // Build Paging
    this.buildPaging(paging, queryString);
    // Build Ordering
    this.buildOrdering(ordering, queryString);
    // Execute the REST service
    return this.httpClient.get<SiteResult>(
      `${this.centralRestServerServiceSecuredURL}/Sites?${queryString}`,
      {
        headers: this.buildHttpHeaders(),
        params: queryString
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  getLogs(params: any, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<LogResult> {
    // dateFrom, level, type, chargingStation, search, action, numberOfLogs, sortDate
    // Verify init
    this._checkInit();
    // Set filter
    const queryString = {};
    // Set Values
    if (params.search) {
      queryString['Search'] = params.search;
    }
    if (params.dateFrom) {
      queryString['DateFrom'] = params.dateFrom;
    }
    if (params.level) {
      queryString['Level'] = params.level;
    }
    if (params.type) {
      queryString['Type'] = params.type;
    }
    if (params.chargingStation) {
      queryString['ChargingStation'] = params.chargingStation;
    }
    if (params.action) {
      queryString['Action'] = params.action;
    }
    // Build Paging
    this.buildPaging(paging, queryString);
    // Build Ordering
    this.buildOrdering(ordering, queryString);
    // Execute the REST service
    // Execute
    return this.httpClient.get<LogResult>(`${this.centralRestServerServiceSecuredURL}/Loggings?${queryString}`,
      {
        headers: this.buildHttpHeaders(),
        params: queryString
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  getLog(id): Observable<Log> {
    // Verify init
    this._checkInit();
    // Call
    return this.httpClient.get(`${this.centralRestServerServiceSecuredURL}/Logging?ID=${id}`,
    {
      headers: this.buildHttpHeaders()
    })
    .pipe(
      catchError(this.handleHttpError)
    );
}

  getUserImage(id: string): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<Image>(`${this.centralRestServerServiceSecuredURL}/UserImage?ID=${id}`,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
}

  getUser(id: string): Observable<User> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get<User>(`${this.centralRestServerServiceSecuredURL}/User?ID=${id}`,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  getEndUserLicenseAgreement(language: string) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`)
      .pipe(
        catchError(this.handleHttpError)
      );
}

  getUserStatuses(): Status[] {
    // Return
    return [
      { key: 'A', description: this.translateService.instant('users.status_active', {}) },
      { key: 'B', description: this.translateService.instant('users.status_blocked', {}) },
      { key: 'I', description: this.translateService.instant('users.status_inactive', {}) },
      { key: 'L', description: this.translateService.instant('users.status_locked', {}) },
      { key: 'P', description: this.translateService.instant('users.status_pending', {}) }
    ];
  }

  getUserStatusByKey(statusKey): Status {
    // Return the found key
    const foundStatus = this.getUserStatuses().find(
      (status) => status.key === statusKey);
    return (foundStatus ? foundStatus : { key: 'U', description: this.translateService.instant('users.status_unknown', {}) });
  }

  getUserRoles(): Role[] {
    // Return
    return [
      { key: 'A', description: this.translateService.instant('users.role_admin', {}) },
      { key: 'B', description: this.translateService.instant('users.role_basic', {}) },
      { key: 'C', description: this.translateService.instant('users.role_corporate', {}) },
      { key: 'D', description: this.translateService.instant('users.role_demo', {}) }
    ];
  }

  getUserRoleByKey(roleKey): Role {
    // Return the found key
    const foundRole = this.getUserRoles().find(
      (role) => role.key === roleKey);
    return (foundRole ? foundRole : { key: 'U', description: this.translateService.instant('users.role_unknown', {}) });
  }

  login(user): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceAuthURL}/Login`, user,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
          catchError(this.handleHttpError)
      );
  }

  loggingSucceeded(token) {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.setLoggedUserToken(token, true);
    // Init Socket IO
    this.centralServerNotificationService.initSocketIO();
    // Set Language
    this.translateService.use(this.getLoggedUser().language);
  }

  setLoggedUserToken(token: string, writeInLocalStorage?: boolean) {
    // Keep token
    this.currentUserToken = token;
    this.currentUser = null;
    // Not null?
    if (token) {
      // Decode the token
      this.currentUser = new JwtHelperService().decodeToken(token);
    }
    // Write?
    if (writeInLocalStorage) {
      // Set the token
      this.localStorageService.setItem('token', token);
    }
  }

  getLoggedUserFromToken(): User {
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

  getLoggedUserToken(): string {
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

  clearLoggedUserToken() {
    // Clear
    this.currentUserToken = null;
    this.currentUser = null;
    // Remove from local storage
    this.localStorageService.removeItem('token');
  }

  isAuthenticated(): boolean {
    return this.getLoggedUserToken() != null && !new JwtHelperService().isTokenExpired(this.getLoggedUserToken());
  }

  logout(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.httpClient.get(`${this.centralRestServerServiceAuthURL}/Logout`,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
          catchError(this.handleHttpError)
      );
  }

  logoutSucceeded() {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.clearLoggedUserToken();
    // Disconnect
    this.centralServerNotificationService.resetSocketIO();
  }

  getLoggedUser(): User {
    // Verify init
    this._checkInit();
    // Init Socket IO
    this.centralServerNotificationService.initSocketIO();
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.getLoggedUserFromToken();
  }

  resetUserPassword(data) {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post(`${this.centralRestServerServiceAuthURL}/Reset`, data,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
          catchError(this.handleHttpError)
      );
  }

  registerUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceAuthURL}/RegisterUser`, user,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  createUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.post<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserCreate`, user,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  updateUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.httpClient.put<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserUpdate`, user,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  deleteUser(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.httpClient.delete<ActionResponse>(`${this.centralRestServerServiceSecuredURL}/UserDelete?ID=${id}`,
      {
        headers: this.buildHttpHeaders()
      })
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  private handleHttpError(error: any, caught: Observable<any>): ObservableInput<{}> {
    // In a real world app, we might use a remote logging infrastructure
    const errMsg = { status: 0, message: '' };
    if (error instanceof Response) {
      errMsg.status = error.status;
      errMsg.message = error.text();
    } else {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
    }
    return throwError(errMsg);
  }
}
