import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Charger } from '../model/charger';
import { Pricing } from '../model/pricing';
import { Log } from '../model/log';
import { User } from '../model/user';
import { Vehicle } from '../model/vehicle';
import { VehicleManufacturer } from '../model/vehicleManufacturer';
import { Site } from '../model/site';
import { Image } from '../model/image';
import { Images } from '../model/images';
import { Logo } from '../model/logo';
import { SiteArea } from '../model/site-area';
import { ActionResponse } from '../model/action-response';
import { Transaction } from '../model/transaction';
import { ChargerConfiguration } from '../model/charger-configuration';
import { ChargerConsumption } from '../model/charger-consumption';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import { Constants } from '../utils/Constants';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from './local-storage.service';
import { WebSocketService } from './web-socket.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { Paging } from '../model/paging';
import { Ordering } from '../model/ordering';

@Injectable()
export class CentralServerService {
    private centralRestServerServiceBaseURL: String;
    private centralRestServerServiceSecuredURL: String;
    private centralRestServerServiceClientUtilURL: String;
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
      // Util API
      this.centralRestServerServiceClientUtilURL = this.centralRestServerServiceBaseURL + '/client/util';
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

  buildOrdering(ordering: Ordering[], filters) {
    // Check
    if (ordering && ordering.length) {
      // Set
      ordering.forEach((order) => {
        filters.push(`SortFields=${order.field}`);
        filters.push(`SortDirs=${order.direction}`);
      });
    }
  }

  buildPaging(paging: Paging, filters) {
    // Limit
    if (paging.limit) {
      filters.push(`Limit=${paging.limit}`);
    }
    // Skip
    if (paging.skip) {
      filters.push(`Skip=${paging.skip}`);
    }
  }

  getSites(params, paging: Paging = Constants.DEFAULT_PAGING, ordering: Ordering[] = []): Observable<Site[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    // Set Values
    if (params.searchValue) {
      filters.push(`Search=${params.searchValue}`);
    }
    if (params.userID) {
      filters.push(`UserID=${params.userID}`);
    }
    // Site Areas
    if (params.withSiteAreas) {
      filters.push(`WithSiteAreas=${params.withSiteAreas}`);
    }
    // Company
    if (params.withCompany) {
      filters.push(`WithCompany=${params.withCompany}`);
    }
    // Charge Boxes
    if (params.withChargeBoxes) {
      filters.push(`WithChargeBoxes=${params.withChargeBoxes}`);
    }
    // Build Paging
    this.buildPaging(paging, filters);
    // Build Ordering
    this.buildOrdering(ordering, filters);
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(
      `${this.centralRestServerServiceSecuredURL}/Sites?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSite(id, withUsers = false): Observable<Site> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    // Set ID
    filters.push(`ID=${id}`);
    // Set With Users
    filters.push(`WithUsers=${withUsers}`);
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Site?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteImages`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteImage?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteSite(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/SiteDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/SiteUpdate`,
      site, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateChargingStationParams(chargingStation): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/ChargingStationUpdateParams`,
      {
        'id': chargingStation.id,
        'numberOfConnectedPhase': chargingStation.numberOfConnectedPhase,
        'chargingStationURL': chargingStation.chargingStationURL
      },
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  createSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/SiteCreate`,
      site, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteAreas(searchValue = null): Observable<SiteArea[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteAreas?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteArea(id): Observable<SiteArea> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteArea?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteAreaImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteAreaImages`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteAreaImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/SiteAreaImage?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteSiteArea(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/SiteAreaDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/SiteAreaUpdate`,
      siteArea, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  createSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/SiteAreaCreate`,
      siteArea, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUsers(searchValue = null, siteID = null): Observable<User[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    if (siteID) {
      filters.push(`SiteID=${siteID}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Users?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/UserImages`,
      new RequestOptions({headers: this.buildHeaders()}))
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

  getPricing(): Observable<Pricing> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Pricing`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransactionYears(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/TransactionYears`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getEndUserLicenseAgreement(language) {
    // Verify init
    this._checkInit();
    const queryString = `Language=${language}`;
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceAuthURL}/EndUserLicenseAgreement?${queryString}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updatePricing(pricing): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/PricingUpdate`,
      pricing, new RequestOptions({headers: this.buildHeaders()}))
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
    const statuses = this.getUserStatuses().filter(
      status => status.key === statusKey);
    return (statuses && statuses.length > 0 ? statuses[0] :
      { key: 'U', description: this.translateService.instant('users.status_unknown', {}) });
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
    const roles = this.getUserRoles().filter(
      role => role.key === roleKey);
    return (roles && roles.length > 0 ? roles[0] : { key: 'U', description: this.translateService.instant('users.role_unknown', {}) });
  }

  getVehicles(searchValue = null): Observable<Vehicle[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Vehicles?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicle(id): Observable<Vehicle> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Vehicle?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleImages(): Observable<Images[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleImages`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleImage(id): Observable<Images> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleImage?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteVehicle(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/VehicleDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateVehicle(vehicle, updateImages): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Check image
    if (updateImages) {
      vehicle.withVehicleImages = true;
    }
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/VehicleUpdate`,
      vehicle, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  createVehicle(vehicle): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/VehicleCreate`,
      vehicle, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturers(searchValue = null, withVehicles = false, vehicleType = null): Observable<VehicleManufacturer[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Vehicle
    if (withVehicles) {
      filters.push(`WithVehicles=${withVehicles}`);
    }
    // Vehicle Type
    if (vehicleType) {
      filters.push(`VehicleType=${vehicleType}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturers?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturer(id): Observable<VehicleManufacturer> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturer?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturerLogos(): Observable<Logo[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturerLogos`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturerLogo(id): Observable<Logo> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturerLogo?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteVehicleManufacturer(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturerDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateVehicleManufacturer(vehicleManufacturer): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturerUpdate`,
      vehicleManufacturer, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  createVehicleManufacturer(vehicleManufacturer): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/VehicleManufacturerCreate`,
      vehicleManufacturer, new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargerStatuses() {
    // Return
    return [
      { key: 'Occupied', description: this.translateService.instant('chargers.status_occupied', {}) },
      { key: 'Available', description: this.translateService.instant('chargers.status_available', {}) },
      { key: 'Preparing', description: this.translateService.instant('chargers.status_preparing', {}) },
      { key: 'Charging', description: this.translateService.instant('chargers.status_charging', {}) },
      { key: 'SuspendedEVSE', description: this.translateService.instant('chargers.status_suspended_evse', {}) },
      { key: 'SuspendedEV', description: this.translateService.instant('chargers.status_suspended_ev', {}) },
      { key: 'Finishing', description: this.translateService.instant('chargers.status_finishing', {}) },
      { key: 'Reserved', description: this.translateService.instant('chargers.status_reserved', {}) },
      { key: 'Unavailable', description: this.translateService.instant('chargers.status_unavailable', {}) },
      { key: 'Faulted', description: this.translateService.instant('chargers.status_faulted', {}) }
    ];
  }

  getChargerStatusByKey(statusKey) {
    // Return the found key
    const statuses = this.getChargerStatuses().filter(
      status => status.key === statusKey);
    return (statuses && statuses.length > 0 ? statuses[0] :
      { key: 'U', description: this.translateService.instant('chargers.status_unknown', {}) });
  }

  getChargerStatusErrors() {
    // Return
    return [
      { key: 'ConnectorLockFailure', description: this.translateService.instant('chargers.status_error_connector_lock_failure', {}) },
      { key: 'EVCommunicationError', description: this.translateService.instant('chargers.status_error_ev_communication_error', {}) },
      { key: 'GroundFailure', description: this.translateService.instant('chargers.status_error_ground_failure', {}) },
      { key: 'HighTemperature', description: this.translateService.instant('chargers.status_error_high_temperature', {}) },
      { key: 'InternalError', description: this.translateService.instant('chargers.status_error_internal_error', {}) },
      { key: 'LocalListConflict', description: this.translateService.instant('chargers.status_error_local_list_conflict', {}) },
      { key: 'NoError', description: this.translateService.instant('chargers.status_error_none', {}) },
      { key: 'OtherError', description: this.translateService.instant('chargers.status_error_other_error', {}) },
      { key: 'OverCurrentFailure', description: this.translateService.instant('chargers.status_error_over_current_failure', {}) },
      { key: 'OverVoltage', description: this.translateService.instant('chargers.status_error_over_voltage', {}) },
      { key: 'PowerMeterFailure', description: this.translateService.instant('chargers.status_error_power_meter_failure', {}) },
      { key: 'PowerSwitchFailure', description: this.translateService.instant('chargers.status_error_power_switch_failure', {}) },
      { key: 'ReaderFailure', description: this.translateService.instant('chargers.status_error_reader_failure', {}) },
      { key: 'ResetFailure', description: this.translateService.instant('chargers.status_error_reset_failure', {}) },
      { key: 'UnderVoltage', description: this.translateService.instant('chargers.status_error_under_voltage', {}) },
      { key: 'WeakSignal', description: this.translateService.instant('chargers.status_error_weak_signal', {}) }
    ];
  }

  getChargerStatusErrorByKey(statusKey) {
    // Return the found key
    const statuses = this.getChargerStatusErrors().filter(
      status => status.key === statusKey);
    return (statuses && statuses.length > 0 ? statuses[0] :
      { key: 'U', description: this.translateService.instant('chargers.status_error_unknown', {}) });
  }

  login(user): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceAuthURL}/Login`, user, new RequestOptions({headers: this.buildHeaders()}))
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

  ping() {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceClientUtilURL}/Ping`)
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

  deleteChargingStation(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/ChargingStationDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getLogs(dateFrom, level, type, chargingStation, searchValue, numberOfLogs, sortDate): Observable<Log[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (dateFrom) {
      filters.push(`DateFrom=${dateFrom}`);
    }
    if (level) {
      filters.push(`Level=${level}`);
    }
    if (type) {
      filters.push(`Type=${type}`);
    }
    if (chargingStation) {
      filters.push(`ChargingStation=${chargingStation}`);
    }
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    if (numberOfLogs) {
      filters.push(`Limit=${numberOfLogs}`);
    }
    if (sortDate) {
      filters.push(`SortDate=${sortDate}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    // Execute
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Loggings?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransactionsCompleted(searchValue, startDateTime, endDateTime, userId, siteId, numberOfTransactions): Observable<Transaction[]> {
    // Set filter
    const filters = [];
    let queryString = '';
    // Search?
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Date
    if (startDateTime) {
      // Convert to ISO?
      if (startDateTime instanceof Date) {
        startDateTime = startDateTime.toISOString();
      }
      filters.push(`StartDateTime=${startDateTime}`);
    }
    if (endDateTime) {
      // Convert to ISO?
      if (endDateTime instanceof Date) {
        endDateTime = endDateTime.toISOString();
      }
      filters.push(`EndDateTime=${endDateTime}`);
    }
    if (userId) {
      filters.push(`UserID=${userId}`);
    }
    if (siteId) {
      filters.push(`SiteID=${siteId}`);
    }
    if (numberOfTransactions) {
      filters.push(`Limit=${numberOfTransactions}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/TransactionsCompleted?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransactionsActive(chargeBoxID, connectorId): Observable<Transaction[]> {
    // Set With Picture
    const filters = [];
    let queryString = '';
    if (chargeBoxID) {
      filters.push(`ChargeBoxID=${chargeBoxID}`);
    }
    if (connectorId) {
      filters.push(`ConnectorId=${connectorId}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/TransactionsActive` +
      (queryString.length > 0 ? '?' + queryString : ''),
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargingStationConsumptionStatistics(year, siteID): Observable<any> {
    // Set With Picture
    let queryString = `Year=${year}`;
    // Site
    if (siteID) {
      queryString += `&SiteID=${siteID}`;
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionStatistics?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargingStationUsageStatistics(year, siteID): Observable<any> {
    // Set With Picture
    let queryString = `Year=${year}`;
    // Site
    if (siteID) {
      queryString += `&SiteID=${siteID}`;
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationUsageStatistics?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserConsumptionStatistics(year, siteID): Observable<any> {
    // Set With Picture
    let queryString = `Year=${year}`;
    // Site
    if (siteID) {
      queryString += `&SiteID=${siteID}`;
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/UserConsumptionStatistics?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserUsageStatistics(year, siteID): Observable<any> {
    // Set With Picture
    let queryString = `Year=${year}`;
    // Site
    if (siteID) {
      queryString += `&SiteID=${siteID}`;
    }
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/UserUsageStatistics?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargingStationTransactions(chargeBoxID, connectorId, startDateTime, endDateTime): Observable<Transaction[]> {
    // Verify init
    this._checkInit();
    // Build Query String
    let queryString = `ChargeBoxID=${chargeBoxID.toString()}`;
    // Params
    if (connectorId) {
      queryString += `&ConnectorId=${connectorId.toString()}`;
    }
    if (startDateTime) {
      // Convert to ISO?
      if (startDateTime instanceof Date) {
        startDateTime = startDateTime.toISOString();
      }
      queryString += `&StartDateTime=${startDateTime}`;
    }
    if (endDateTime) {
      // Convert to ISO?
      if (endDateTime instanceof Date) {
        endDateTime = endDateTime.toISOString();
      }
      queryString += `&EndDateTime=${endDateTime}`;
    }
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationTransactions?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransaction(id): Observable<Transaction> {
    // Verify init
    this._checkInit();
    // Build Query String
    const queryString = `ID=${id}`;
    // Call
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/Transaction?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargers(searchValue = null, withNoSiteArea = false): Observable<Charger[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Only with Site Area?
    filters.push(`WithNoSiteArea=${withNoSiteArea}`);
    // Build the query string
    if (filters.length > 0) {
      queryString = '?' + filters.join('&');
    }
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStations${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCharger(chargeBoxID): Observable<Charger> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStation?ID=${chargeBoxID}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargerConfiguration(chargeBoxID): Observable<ChargerConfiguration> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    const queryString = `ChargeBoxID=${chargeBoxID}`;
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationConfiguration?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  setChargerMaxIntensitySocket(chargeBoxID, maxIntensity): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationSetMaxIntensitySocket`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "maxIntensity": "${maxIntensity}"
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  setChargerConfiguration(chargeBoxID, key, value): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationChangeConfiguration`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "key": "${key}",
            "value": "${value}"
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargerConsumptionFromTransaction(transactionId, startDateTime?): Observable<ChargerConsumption> {
    // Verify init
    this._checkInit();
    // Set Transaction
    let queryString = 'TransactionId=' + transactionId.toString();
    // Set date/time
    if (startDateTime) {
      // Convert to ISO?
      if (startDateTime instanceof Date) {
        startDateTime = startDateTime.toISOString();
      }
      queryString += '&StartDateTime=' + startDateTime;
    }
    return this.http.get(`${this.centralRestServerServiceSecuredURL}/ChargingStationConsumptionFromTransaction?${queryString}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  reset(chargeBoxID, type): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationReset`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "type": "${type}"
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  startTransaction(chargeBoxID, tagID): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationStartTransaction`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "tagID": "${tagID}"
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  stopTransaction(chargeBoxID, transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationStopTransaction`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "transactionId": ${transactionId}
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  softStopTransaction(transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralRestServerServiceSecuredURL.toString()}/TransactionSoftStop`,
      `{ "transactionId": "${transactionId}" }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteTransaction(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralRestServerServiceSecuredURL}/TransactionDelete?ID=${id}`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  refundTransaction(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL}/TransactionRefund`,
      { 'id': id },
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  unlockConnector(chargeBoxID, transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationUnlockConnector`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "transactionId": ${transactionId}
          }
        }`,
      new RequestOptions({headers: this.buildHeaders()}))
      .map(this.extractData)
      .catch(this.handleError);
  }

  clearCache(chargeBoxID): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralRestServerServiceSecuredURL.toString()}/ChargingStationClearCache`, `
				{
					"chargeBoxID": "${chargeBoxID}"
				}`,
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
