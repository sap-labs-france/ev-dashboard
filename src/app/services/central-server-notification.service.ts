import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {SubjectInfo} from '../common.types';
import io from 'socket.io-client';
import {Constants} from '../utils/Constants';

@Injectable()
export class CentralServerNotificationService {
  private centralRestServerServiceURL: String;
  private subjectTenants = new Subject<SubjectInfo>();
  private subjectTenant = new Subject<SubjectInfo>();
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
  private subjectLoggings = new Subject<SubjectInfo>();
  private subjectSettings = new Subject<SubjectInfo>();
  private subjectSetting = new Subject<SubjectInfo>();
  private subjectOcpiEndpoints = new Subject<SubjectInfo>();
  private subjectOcpiEndpoint = new Subject<SubjectInfo>();
  private subjectAnalyticsLinks = new Subject<SubjectInfo>();
  private socket;

  constructor() {
  }

  public setcentralRestServerServiceURL(url) {
    this.centralRestServerServiceURL = url;
  }

  public getSubjectCompanies(): Observable<SubjectInfo> {
    return this.subjectCompanies.asObservable();
  }

  public getSubjectCompany(): Observable<SubjectInfo> {
    return this.subjectCompany.asObservable();
  }

  public getSubjectSites(): Observable<SubjectInfo> {
    return this.subjectSites.asObservable();
  }

  public getSubjectSite(): Observable<SubjectInfo> {
    return this.subjectSite.asObservable();
  }

  public getSubjectSiteAreas(): Observable<SubjectInfo> {
    return this.subjectSiteAreas.asObservable();
  }

  public getSubjectSiteArea(): Observable<SubjectInfo> {
    return this.subjectSiteArea.asObservable();
  }

  public getSubjectUsers(): Observable<SubjectInfo> {
    return this.subjectUsers.asObservable();
  }

  public getSubjectUser(): Observable<SubjectInfo> {
    return this.subjectUser.asObservable();
  }

  public getSubjectVehicles(): Observable<SubjectInfo> {
    return this.subjectVehicles.asObservable();
  }

  public getSubjectVehicle(): Observable<SubjectInfo> {
    return this.subjectVehicle.asObservable();
  }

  public getSubjectVehicleManufacturers(): Observable<SubjectInfo> {
    return this.subjectVehicleManufacturers.asObservable();
  }

  public getSubjectVehicleManufacturer(): Observable<SubjectInfo> {
    return this.subjectVehicleManufacturer.asObservable();
  }

  public getSubjectTransactions(): Observable<SubjectInfo> {
    return this.subjectTransactions.asObservable();
  }

  public getSubjectTransaction(): Observable<SubjectInfo> {
    return this.subjectTransaction.asObservable();
  }

  public getSubjectChargingStations(): Observable<SubjectInfo> {
    return this.subjectChargingStations.asObservable();
  }

  public getSubjectChargingStation(): Observable<SubjectInfo> {
    return this.subjectChargingStation.asObservable();
  }

  public getSubjectLoggings(): Observable<SubjectInfo> {
    return this.subjectLoggings.asObservable();
  }

  public getSubjectTenants(): Observable<SubjectInfo> {
    return this.subjectTenants.asObservable();
  }

  public getSubjectTenant(): Observable<SubjectInfo> {
    return this.subjectTenant.asObservable();
  }

  public getSubjectSettings(): Observable<SubjectInfo> {
    return this.subjectSettings.asObservable();
  }

  public getSubjectSetting(): Observable<SubjectInfo> {
    return this.subjectSetting.asObservable();
  }

  public getSubjectOcpiEndpoints(): Observable<SubjectInfo> {
    return this.subjectOcpiEndpoints.asObservable();
  }

  public getSubjectAnalyticsLinks(): Observable<SubjectInfo> {
    return this.subjectAnalyticsLinks.asObservable();
  }

  public getSubjectOcpiEndpoint(): Observable<SubjectInfo> {
    return this.subjectOcpiEndpoint.asObservable();
  }

  public initSocketIO(tenantID: String) {
    // Check
    if (!this.socket && tenantID) {
      // Connect to Socket IO
      this.socket = io(`${this.centralRestServerServiceURL}?tenantID=${tenantID}`);

      // Monitor Companies`
      this.socket.on(Constants.ENTITY_COMPANIES, () => {
        // Notify
        this.subjectCompanies.next();
      });

      // Monitor Company
      this.socket.on(Constants.ENTITY_COMPANY, (notifInfo) => {
        // Notify
        this.subjectCompany.next(notifInfo);
      });

      // Monitor Tenants
      this.socket.on(Constants.ENTITY_TENANTS, () => {
        // Notify
        this.subjectTenants.next();
      });

      // Monitor Tenant
      this.socket.on(Constants.ENTITY_TENANT, (notifInfo) => {
        // Notify
        this.subjectTenant.next(notifInfo);
      });

      // Monitor Sites
      this.socket.on(Constants.ENTITY_SITES, () => {
        // Notify
        this.subjectSites.next();
      });

      // Monitor Site
      this.socket.on(Constants.ENTITY_SITE, (notifInfo) => {
        // Notify
        this.subjectSite.next(notifInfo);
      });

      // Monitor Site Areas
      this.socket.on(Constants.ENTITY_SITE_AREAS, () => {
        // Notify
        this.subjectSiteAreas.next();
      });

      // Monitor Site Area
      this.socket.on(Constants.ENTITY_SITE_AREA, (notifInfo) => {
        // Notify
        this.subjectSiteArea.next(notifInfo);
      });

      // Monitor Users
      this.socket.on(Constants.ENTITY_USERS, () => {
        // Notify
        this.subjectUsers.next();
      });

      // Monitor User
      this.socket.on(Constants.ENTITY_USER, (notifInfo) => {
        // Notify
        this.subjectUser.next(notifInfo);
      });

      // Monitor Vehicles
      this.socket.on(Constants.ENTITY_VEHICLES, () => {
        // Notify
        this.subjectVehicles.next();
      });

      // Monitor Vehicle
      this.socket.on(Constants.ENTITY_VEHICLE, (notifInfo) => {
        // Notify
        this.subjectVehicle.next(notifInfo);
      });

      // Monitor Vehicle Manufacturers
      this.socket.on(Constants.ENTITY_VEHICLE_MANUFACTURERS, () => {
        // Notify
        this.subjectVehicleManufacturers.next();
      });

      // Monitor Vehicle Manufacturer
      this.socket.on(Constants.ENTITY_VEHICLE_MANUFACTURER, (notifInfo) => {
        // Notify
        this.subjectVehicleManufacturer.next(notifInfo);
      });

      // Monitor Transactions
      this.socket.on(Constants.ENTITY_TRANSACTIONS, () => {
        // Notify
        this.subjectTransactions.next();
      });

      // Monitor Transaction
      this.socket.on(Constants.ENTITY_TRANSACTION, (notifInfo) => {
        // Notify
        this.subjectTransaction.next(notifInfo);
      });

      // Monitor Charging Stations
      this.socket.on(Constants.ENTITY_CHARGING_STATIONS, () => {
        // Notify
        this.subjectChargingStations.next();
      });

      // Monitor Charging Station
      this.socket.on(Constants.ENTITY_CHARGING_STATION, (notifInfo) => {
        // Notify
        this.subjectChargingStation.next(notifInfo);
      });

      // Monitor Logging
      this.socket.on(Constants.ENTITY_LOGGINGS, () => {
        // Notify
        this.subjectLoggings.next();
      });
    }
  }

  public resetSocketIO() {
    // Check: socket not initialised and user logged
    if (this.socket) {
      // Close
      this.socket.disconnect();
      // Clear
      this.socket = null;
    }
  }
}
