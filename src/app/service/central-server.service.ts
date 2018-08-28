import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { User } from '../model/user';
import { Site } from '../model/site';
import { Image } from '../model/image';
import { ActionResponse } from '../model/action-response';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../utils/Constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from './local-storage.service';
import { WebSocketService } from './web-socket.service';
import { Paging } from '../model/paging';
import { Ordering } from '../model/ordering';

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
      private http: Http,
      private translateService: TranslateService,
      private localStorageService: LocalStorageService,
      private webSocketService: WebSocketService,
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
      this.webSocketService.setcentralRestServerServiceURL(this.centralRestServerServiceBaseURL);
      // Auth API
      this.centralRestServerServiceAuthURL = this.centralRestServerServiceBaseURL + '/client/auth';
      // Secured API
      this.centralRestServerServiceSecuredURL = this.centralRestServerServiceBaseURL + '/client/api';
      // Done
      this.initialized = true;
    }
  }

  buildHeaders() {
    const header = {
      'Content-Type': 'application/json',
    };
    // Check token
    if (this.getCurrentUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getCurrentUserToken();
    }
    // Build Header
    return new Headers(header);
  }

  buildOrdering(ordering: Ordering[], queryString) {
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

  buildPaging(paging: Paging, queryString) {
    // Limit
    if (paging.limit) {
      queryString['Limit'] = paging.limit;
    }
    // Skip
    if (paging.skip) {
      queryString['Skip'] = paging.skip;
    }
  }

  getSites(params, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Site[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const queryString = {};
    // Set Values
    if (params.searchValue) {
      queryString['Search'] = params.searchValue;
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
    return this.http.get(
      `${this.centralRestServerServiceSecuredURL}/Sites?${queryString}`,
      new RequestOptions({
        headers: this.buildHeaders(),
        params: queryString
      }))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/UserImage?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUser(id): Observable<User> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/User?ID=${id}`,
      new RequestOptions({
        headers: this.buildHeaders()
      }))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getEndUserLicenseAgreement(language) {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserStatuses() {
    // Return
    return [
      { key: 'A', description: this.translateService.instant('users.status_active', {}) },
      { key: 'B', description: this.translateService.instant('users.status_blocked', {}) },
      { key: 'I', description: this.translateService.instant('users.status_inactive', {}) },
      { key: 'L', description: this.translateService.instant('users.status_locked', {}) },
      { key: 'P', description: this.translateService.instant('users.status_pending', {}) }
    ];
  }

  getUserStatusByKey(statusKey) {
    // Return the found key
    const foundStatus = this.getUserStatuses().find(
      (status) => status.key === statusKey);
    return (foundStatus ? foundStatus : { key: 'U', description: this.translateService.instant('users.status_unknown', {}) });
  }

  getUserRoles() {
    // Return
    return [
      { key: 'A', description: this.translateService.instant('users.role_admin', {}) },
      { key: 'B', description: this.translateService.instant('users.role_basic', {}) },
      { key: 'C', description: this.translateService.instant('users.role_corporate', {}) },
      { key: 'D', description: this.translateService.instant('users.role_demo', {}) }
    ];
  }

  getUserRoleByKey(roleKey) {
    // Return the found key
    const foundRole = this.getUserRoles().filter(
      (role) => role.key === roleKey);
    return (foundRole ? foundRole : { key: 'U', description: this.translateService.instant('users.role_unknown', {}) });
  }

  login(user): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceAuthURL}/Login`, user,
        new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  loggingSucceeded(token) {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.setCurrentUserToken(token, true);
    // Init Socket IO
    this.webSocketService.initSocketIO();
    // Set Language
    this.translateService.use(this.getLoggedUser().language);
  }

  setCurrentUserToken(token, writeInLocalStorage?) {
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

  getCurrentUser() {
    // Get the token
    if (!this.currentUser) {
      // Decode the token
      this.localStorageService.getItem('token').subscribe((token) => {
        // Keep it local (iFrame use case)
        this.setCurrentUserToken(token);
      });
    }
    return this.currentUser;
  }

  getCurrentUserToken() {
    // Get the token
    if (!this.currentUserToken) {
      // Decode the token
      this.localStorageService.getItem('token').subscribe((token) => {
        // Keep it local (iFrame use case)
        this.setCurrentUserToken(token);
      });
    }
    return this.currentUserToken;
  }

  clearCurrentUserToken() {
    // Clear
    this.currentUserToken = null;
    this.currentUser = null;
    // Remove from local storage
    this.localStorageService.removeItem('token');
  }

  isAuthenticated() {
    return this.getCurrentUserToken() != null && !new JwtHelperService().isTokenExpired(this.getCurrentUserToken());
  }

  logout(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceAuthURL}/Logout`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  logoutSucceeded() {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.clearCurrentUserToken();
    // Disconnect
    this.webSocketService.resetSocketIO();
  }

  getLoggedUser() {
    // Verify init
    this._checkInit();
    // Init Socket IO
    this.webSocketService.initSocketIO();
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.getCurrentUser();
  }

  resetUserPassword(data) {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceAuthURL}/Reset`,
      data, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  registerUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceAuthURL}/RegisterUser`,
      user, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  createUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/UserCreate`,
      user, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/UserUpdate`,
      user, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteUser(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/UserDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    // Must be JSon response
    return res.json() || [];
  }

  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    const errMsg = { status: 0, message: '' };
    if (error instanceof Response) {
      errMsg.status = error.status;
      errMsg.message = error.text();
    } else {
      errMsg.status = error.status;
      errMsg.message = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }
}
