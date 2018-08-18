import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Charger } from '../model/charger';
import { Pricing } from '../model/pricing';
import { Log } from '../model/log';
import { User } from '../model/user';
import { Vehicle } from '../model/vehicle';
import { VehicleManufacturer } from '../model/vehicleManufacturer';
import { Company } from '../model/company';
import { Site } from '../model/site';
import { Image } from '../model/image';
import { Images } from '../model/images';
import { Logo } from '../model/logo';
import { SiteArea } from '../model/site-area';
import { SubjectInfo } from '../model/subject-info';
import { ActionResponse } from '../model/action-response';
import { Transaction } from '../model/transaction';
import { ChargerConfiguration } from '../model/charger-configuration';
import { ChargerConsumption } from '../model/charger-consumption';
import { ConfigService } from './config.service';
import { TranslateService } from '@ngx-translate/core';
import * as io from 'socket.io-client';
import { Authorizations } from '../utils/Authorizations';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LocalStorageService } from './local-storage.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class CentralServerService {
  private centralServerRESTServiceBaseURL: String;
  private centralServerRESTServiceSecuredURL: String;
  private centralServerRESTServiceClientUtilURL: String;
  private centralServerRESTServiceAuthURL: String;
  private subjectChargingStations = new Subject<SubjectInfo>();
  private subjectChargingStation = new Subject<SubjectInfo>();
  private subjectCompanies = new Subject<SubjectInfo>();
  private subjectCompany = new Subject<SubjectInfo>();
  private subjectSites = new Subject<SubjectInfo>();
  private subjectSite = new Subject<SubjectInfo>();
  private subjectSiteAreas = new Subject<SubjectInfo>();
  private subjectSiteArea = new Subject<SubjectInfo>();
  private subjectUsers = new Subject<SubjectInfo>();
  private subjectUser = new Subject<SubjectInfo>();
  private subjectVehicles = new Subject<SubjectInfo>();
  private subjectVehicle = new Subject<SubjectInfo>();
  private subjectVehicleManufacturers = new Subject<SubjectInfo>();
  private subjectVehicleManufacturer = new Subject<SubjectInfo>();
  private subjectTransactions = new Subject<SubjectInfo>();
  private subjectTransaction = new Subject<SubjectInfo>();
  private subjectLogging = new Subject<SubjectInfo>();
  private centralSystemServerConfig;
  private initialized: Boolean;
  private socket;
  private currentUserToken;
  private currentUser;

  constructor(
    private http: Http,
    private translateService: TranslateService,
    private localStorageService: LocalStorageService,
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
      this.centralServerRESTServiceBaseURL = this.centralSystemServerConfig.protocol + '://' +
        this.centralSystemServerConfig.host + ':' + this.centralSystemServerConfig.port;
      // Auth API
      this.centralServerRESTServiceAuthURL = this.centralServerRESTServiceBaseURL + '/client/auth';
      // Secured API
      this.centralServerRESTServiceSecuredURL = this.centralServerRESTServiceBaseURL + '/client/api';
      // Util API
      this.centralServerRESTServiceClientUtilURL = this.centralServerRESTServiceBaseURL + '/client/util';
      // Done
      this.initialized = true;
    }
  }

  getSubjectCompanies(): Observable<SubjectInfo> {
    return this.subjectCompanies.asObservable();
  }

  getSubjectCompany(): Observable<SubjectInfo> {
    return this.subjectCompany.asObservable();
  }

  getSubjectSites(): Observable<SubjectInfo> {
    return this.subjectSites.asObservable();
  }

  getSubjectSite(): Observable<SubjectInfo> {
    return this.subjectSite.asObservable();
  }

  getSubjectSiteAreas(): Observable<SubjectInfo> {
    return this.subjectSiteAreas.asObservable();
  }

  getSubjectSiteArea(): Observable<SubjectInfo> {
    return this.subjectSiteArea.asObservable();
  }

  getSubjectUsers(): Observable<SubjectInfo> {
    return this.subjectUsers.asObservable();
  }

  getSubjectUser(): Observable<SubjectInfo> {
    return this.subjectUser.asObservable();
  }

  getSubjectVehicles(): Observable<SubjectInfo> {
    return this.subjectVehicles.asObservable();
  }

  getSubjectVehicle(): Observable<SubjectInfo> {
    return this.subjectVehicle.asObservable();
  }

  getSubjectVehicleManufacturers(): Observable<SubjectInfo> {
    return this.subjectVehicleManufacturers.asObservable();
  }

  getSubjectVehicleManufacturer(): Observable<SubjectInfo> {
    return this.subjectVehicleManufacturer.asObservable();
  }

  getSubjectTransactions(): Observable<SubjectInfo> {
    return this.subjectTransactions.asObservable();
  }

  getSubjectTransaction(): Observable<SubjectInfo> {
    return this.subjectTransaction.asObservable();
  }

  getSubjectChargingStations(): Observable<SubjectInfo> {
    return this.subjectChargingStations.asObservable();
  }

  getSubjectChargingStation(): Observable<SubjectInfo> {
    return this.subjectChargingStation.asObservable();
  }

  getSubjectLogging(): Observable<SubjectInfo> {
    return this.subjectLogging.asObservable();
  }

  buildHeaderOptions() {
    const header = {
      'Content-Type': 'application/json',
    };
    // Check token
    if (this.getCurrentUserToken()) {
      header['Authorization'] = 'Bearer ' + this.getCurrentUserToken();
    }
    // Build Header
    const headers = new Headers(header);
    // Build Request Option
    return new RequestOptions({ headers: headers });
  }

  initSocketIO() {
    // Check: socket not initialised and user logged
    if (!this.socket && this.getCurrentUser()) {
      // Connect to Socket IO
      this.socket = io(this.centralServerRESTServiceBaseURL);

      // Monitor Companies`
      this.socket.on(Authorizations.ENTITY_COMPANIES, () => {
        // Notify
        this.subjectCompanies.next();
      });

      // Monitor Company
      this.socket.on(Authorizations.ENTITY_COMPANY, (notifInfo) => {
        // Notify
        this.subjectCompany.next(notifInfo);
      });

      // Monitor Sites
      this.socket.on(Authorizations.ENTITY_SITES, () => {
        // Notify
        this.subjectSites.next();
      });

      // Monitor Site
      this.socket.on(Authorizations.ENTITY_SITE, (notifInfo) => {
        // Notify
        this.subjectSite.next(notifInfo);
      });

      // Monitor Site Areas
      this.socket.on(Authorizations.ENTITY_SITE_AREAS, () => {
        // Notify
        this.subjectSiteAreas.next();
      });

      // Monitor Site Area
      this.socket.on(Authorizations.ENTITY_SITE_AREA, (notifInfo) => {
        // Notify
        this.subjectSiteArea.next(notifInfo);
      });

      // Monitor Users
      this.socket.on(Authorizations.ENTITY_USERS, () => {
        // Notify
        this.subjectUsers.next();
      });

      // Monitor User
      this.socket.on(Authorizations.ENTITY_USER, (notifInfo) => {
        // Notify
        this.subjectUser.next(notifInfo);
      });

      // Monitor Vehicles
      this.socket.on(Authorizations.ENTITY_VEHICLES, () => {
        // Notify
        this.subjectVehicles.next();
      });

      // Monitor Vehicle
      this.socket.on(Authorizations.ENTITY_VEHICLE, (notifInfo) => {
        // Notify
        this.subjectVehicle.next(notifInfo);
      });

      // Monitor Vehicle Manufacturers
      this.socket.on(Authorizations.ENTITY_VEHICLE_MANUFACTURERS, () => {
        // Notify
        this.subjectVehicleManufacturers.next();
      });

      // Monitor Vehicle Manufacturer
      this.socket.on(Authorizations.ENTITY_VEHICLE_MANUFACTURER, (notifInfo) => {
        // Notify
        this.subjectVehicleManufacturer.next(notifInfo);
      });

      // Monitor Transactions
      this.socket.on(Authorizations.ENTITY_TRANSACTIONS, () => {
        // Notify
        this.subjectTransactions.next();
      });

      // Monitor Transaction
      this.socket.on(Authorizations.ENTITY_TRANSACTION, (notifInfo) => {
        // Notify
        this.subjectTransaction.next(notifInfo);
      });

      // Monitor Charging Stations
      this.socket.on(Authorizations.ENTITY_CHARGING_STATIONS, () => {
        // Notify
        this.subjectChargingStations.next();
      });

      // Monitor Charging Station
      this.socket.on(Authorizations.ENTITY_CHARGING_STATION, (notifInfo) => {
        // Notify
        this.subjectChargingStation.next(notifInfo);
      });

      // Monitor Logging
      this.socket.on(Authorizations.ENTITY_LOGGING, () => {
        // Notify
        this.subjectLogging.next();
      });
    }
  }

  resetSocketIO() {
    // Check: socket not initialised and user logged
    if (this.socket) {
      // Close
      this.socket.disconnect();
      // Clear
      this.socket = null;
    }
  }

  getCompanies(searchValue = null): Observable<Company[]> {
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Companies?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompany(id): Observable<Company> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString;
    // Set ID
    filters.push(`ID=${id}`);
    // Build the query string
    queryString = filters.join('&');
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Company?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  isAuthorized(action, arg1, arg2): Observable<any> {
    // Verify init
    this._checkInit();
    // Set filter
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
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/IsAuthorized?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompanyLogos(): Observable<Logo[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/CompanyLogos`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompanyLogo(id): Observable<Logo> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/CompanyLogo?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteCompany(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/CompanyDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCompany(company): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/CompanyUpdate`,
      company, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  createCompany(company): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/CompanyCreate`,
      company, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSites(searchValue = null, withCompany = false, withSiteAreas = false, withChargeBoxes = false): Observable<Site[]> {
    // Verify init
    this._checkInit();
    // Set filter
    const filters = [];
    let queryString = '';
    if (searchValue) {
      filters.push(`Search=${searchValue}`);
    }
    // Site Areas
    if (withSiteAreas) {
      filters.push(`WithSiteAreas=${withSiteAreas}`);
    }
    // Company
    if (withCompany) {
      filters.push(`WithCompany=${withCompany}`);
    }
    // Charge Boxes
    if (withChargeBoxes) {
      filters.push(`WithChargeBoxes=${withChargeBoxes}`);
    }
    // Build the query string
    if (filters.length > 0) {
      queryString = filters.join('&');
    }
    // Execute the REST service
    return this.http.get(
      `${this.centralServerRESTServiceSecuredURL}/Sites?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Site?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteImages`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteImage?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteSite(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/SiteDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/SiteUpdate`,
      site, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateChargingStationParams(chargingStation): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/ChargingStationUpdateParams`,
      {
        'id': chargingStation.id,
        'numberOfConnectedPhase': chargingStation.numberOfConnectedPhase,
        'chargingStationURL': chargingStation.chargingStationURL
      },
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  createSite(site): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/SiteCreate`,
      site, this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteAreas?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteArea(id): Observable<SiteArea> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteArea?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteAreaImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteAreaImages`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteAreaImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/SiteAreaImage?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteSiteArea(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/SiteAreaDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/SiteAreaUpdate`,
      siteArea, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  createSiteArea(siteArea): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/SiteAreaCreate`,
      siteArea, this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Users?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserImages(): Observable<Image[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/UserImages`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUserImage(id): Observable<Image> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/UserImage?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getUser(id): Observable<User> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/User?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getPricing(): Observable<Pricing> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Pricing`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransactionYears(): Observable<any> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/TransactionYears`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getEndUserLicenseAgreement(language) {
    // Verify init
    this._checkInit();
    const queryString = `Language=${language}`;
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceAuthURL}/EndUserLicenseAgreement?${queryString}`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updatePricing(pricing): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/PricingUpdate`,
      pricing, this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Vehicles?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicle(id): Observable<Vehicle> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Vehicle?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleImages(): Observable<Images[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleImages`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleImage(id): Observable<Images> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleImage?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteVehicle(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/VehicleDelete?ID=${id}`,
      this.buildHeaderOptions())
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
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/VehicleUpdate`,
      vehicle, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  createVehicle(vehicle): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/VehicleCreate`,
      vehicle, this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturers?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturer(id): Observable<VehicleManufacturer> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturer?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturerLogos(): Observable<Logo[]> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturerLogos`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getVehicleManufacturerLogo(id): Observable<Logo> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturerLogo?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteVehicleManufacturer(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturerDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateVehicleManufacturer(vehicleManufacturer): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturerUpdate`,
      vehicleManufacturer, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  createVehicleManufacturer(vehicleManufacturer): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/VehicleManufacturerCreate`,
      vehicleManufacturer, this.buildHeaderOptions())
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
    return this.http.post(`${this.centralServerRESTServiceAuthURL}/Login`, user, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  loggingSucceeded(token) {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.setCurrentUserToken(token, true);
    // Init Socket IO
    this.initSocketIO();
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
    return this.http.get(`${this.centralServerRESTServiceAuthURL}/Logout`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  logoutSucceeded() {
    // Verify init
    this._checkInit();
    // Keep it local (iFrame use case)
    this.clearCurrentUserToken();
    // Disconnect
    this.resetSocketIO();
  }

  getLoggedUser() {
    // Verify init
    this._checkInit();
    // Init Socket IO
    this.initSocketIO();
    // Return the user (should have already been initialized as the token is retrieved async)
    return this.getCurrentUser();
  }

  resetUserPassword(data) {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceAuthURL}/Reset`,
      data, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  registerUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceAuthURL}/RegisterUser`,
      user, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  ping() {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceClientUtilURL}/Ping`)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/UserCreate`,
      user, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateUser(user): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL}/UserUpdate`,
      user, this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteUser(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/UserDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteChargingStation(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/ChargingStationDelete?ID=${id}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Loggings?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/TransactionsCompleted?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/TransactionsActive` +
      (queryString.length > 0 ? '?' + queryString : ''),
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStationConsumptionStatistics?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStationUsageStatistics?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/UserConsumptionStatistics?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/UserUsageStatistics?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStationTransactions?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTransaction(id): Observable<Transaction> {
    // Verify init
    this._checkInit();
    // Build Query String
    const queryString = `ID=${id}`;
    // Call
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/Transaction?${queryString}`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStations${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCharger(chargeBoxID): Observable<Charger> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStation?ID=${chargeBoxID}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  getChargerConfiguration(chargeBoxID): Observable<ChargerConfiguration> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    const queryString = `ChargeBoxID=${chargeBoxID}`;
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStationConfiguration?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  setChargerMaxIntensitySocket(chargeBoxID, maxIntensity): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationSetMaxIntensitySocket`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "maxIntensity": "${maxIntensity}"
          }
        }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  setChargerConfiguration(chargeBoxID, key, value): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationChangeConfiguration`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "key": "${key}",
            "value": "${value}"
          }
        }`,
      this.buildHeaderOptions())
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
    return this.http.get(`${this.centralServerRESTServiceSecuredURL}/ChargingStationConsumptionFromTransaction?${queryString}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  reset(chargeBoxID, type): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationReset`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "type": "${type}"
          }
        }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  startTransaction(chargeBoxID, tagID): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationStartTransaction`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "tagID": "${tagID}"
          }
        }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  stopTransaction(chargeBoxID, transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationStopTransaction`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "transactionId": ${transactionId}
          }
        }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  softStopTransaction(transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.put(`${this.centralServerRESTServiceSecuredURL.toString()}/TransactionSoftStop`,
      `{ "transactionId": "${transactionId}" }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteTransaction(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute the REST service
    // Execute
    return this.http.delete(`${this.centralServerRESTServiceSecuredURL}/TransactionDelete?ID=${id}`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  refundTransaction(id): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL}/TransactionRefund`,
      { 'id': id },
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  unlockConnector(chargeBoxID, transactionId): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationUnlockConnector`, `
        {
          "chargeBoxID": "${chargeBoxID}",
          "args": {
            "transactionId": ${transactionId}
          }
        }`,
      this.buildHeaderOptions())
      .map(this.extractData)
      .catch(this.handleError);
  }

  clearCache(chargeBoxID): Observable<ActionResponse> {
    // Verify init
    this._checkInit();
    // Execute
    return this.http.post(`${this.centralServerRESTServiceSecuredURL.toString()}/ChargingStationClearCache`, `
				{
					"chargeBoxID": "${chargeBoxID}"
				}`,
      this.buildHeaderOptions())
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
