import { Injectable } from '@angular/core';
import { Entity } from 'app/types/Authorization';
import { Observable, Subject } from 'rxjs';

import ChangeNotification from '../types/ChangeNotification';
import SingleChangeNotification from '../types/SingleChangeNotification';
import SocketIOClient from '../utils/SocketIOClient';

@Injectable()
export class CentralServerNotificationService {
  private centralRestServerServiceURL!: string;
  private subjectTenants = new Subject<ChangeNotification>();
  private subjectTenant = new Subject<SingleChangeNotification>();
  private subjectChargingStations = new Subject<ChangeNotification>();
  private subjectChargingStation = new Subject<SingleChangeNotification>();
  private subjectCompanies = new Subject<ChangeNotification>();
  private subjectCompany = new Subject<SingleChangeNotification>();
  private subjectSites = new Subject<ChangeNotification>();
  private subjectSite = new Subject<SingleChangeNotification>();
  private subjectSiteAreas = new Subject<ChangeNotification>();
  private subjectSiteArea = new Subject<SingleChangeNotification>();
  private subjectUsers = new Subject<ChangeNotification>();
  private subjectUser = new Subject<SingleChangeNotification>();
  private subjectTransactions = new Subject<ChangeNotification>();
  private subjectTransaction = new Subject<SingleChangeNotification>();
  private subjectLoggings = new Subject<ChangeNotification>();
  private subjectSettings = new Subject<ChangeNotification>();
  private subjectSetting = new Subject<SingleChangeNotification>();
  private subjectOcpiEndpoints = new Subject<ChangeNotification>();
  private subjectOcpiEndpoint = new Subject<SingleChangeNotification>();
  private subjectAssets = new Subject<ChangeNotification>();
  private subjectAsset = new Subject<SingleChangeNotification>();
  private subjectAnalyticsLinks = new Subject<ChangeNotification>();
  private subjectRegistrationTokens = new Subject<ChangeNotification>();
  private subjectRegistrationToken = new Subject<SingleChangeNotification>();
  private subjectInvoices = new Subject<ChangeNotification>();
  private subjectInvoice = new Subject<SingleChangeNotification>();
  private subjectChargingProfiles = new Subject<ChangeNotification>();
  private subjectChargingProfile = new Subject<SingleChangeNotification>();
  private subjectCars = new Subject<ChangeNotification>();
  private subjectCar = new Subject<SingleChangeNotification>();
  private subjectCarCatalogs = new Subject<ChangeNotification>();
  private subjectCarCatalog = new Subject<SingleChangeNotification>();
  private socketIOClient: SocketIOClient;

  public setcentralRestServerServiceURL(url: string) {
    this.centralRestServerServiceURL = url;
  }

  public getSubjectCompanies(): Observable<ChangeNotification> {
    return this.subjectCompanies.asObservable();
  }

  public getSubjectCompany(): Observable<SingleChangeNotification> {
    return this.subjectCompany.asObservable();
  }

  public getSubjectSites(): Observable<ChangeNotification> {
    return this.subjectSites.asObservable();
  }

  public getSubjectSite(): Observable<SingleChangeNotification> {
    return this.subjectSite.asObservable();
  }

  public getSubjectSiteAreas(): Observable<ChangeNotification> {
    return this.subjectSiteAreas.asObservable();
  }

  public getSubjectSiteArea(): Observable<SingleChangeNotification> {
    return this.subjectSiteArea.asObservable();
  }

  public getSubjectUsers(): Observable<ChangeNotification> {
    return this.subjectUsers.asObservable();
  }

  public getSubjectUser(): Observable<SingleChangeNotification> {
    return this.subjectUser.asObservable();
  }

  public getSubjectTransactions(): Observable<ChangeNotification> {
    return this.subjectTransactions.asObservable();
  }

  public getSubjectTransaction(): Observable<SingleChangeNotification> {
    return this.subjectTransaction.asObservable();
  }

  public getSubjectChargingStations(): Observable<ChangeNotification> {
    return this.subjectChargingStations.asObservable();
  }

  public getSubjectChargingStation(): Observable<SingleChangeNotification> {
    return this.subjectChargingStation.asObservable();
  }

  public getSubjectLoggings(): Observable<ChangeNotification> {
    return this.subjectLoggings.asObservable();
  }

  public getSubjectTenants(): Observable<ChangeNotification> {
    return this.subjectTenants.asObservable();
  }

  public getSubjectTenant(): Observable<SingleChangeNotification> {
    return this.subjectTenant.asObservable();
  }

  public getSubjectSettings(): Observable<ChangeNotification> {
    return this.subjectSettings.asObservable();
  }

  public getSubjectSetting(): Observable<SingleChangeNotification> {
    return this.subjectSetting.asObservable();
  }

  public getSubjectOcpiEndpoints(): Observable<ChangeNotification> {
    return this.subjectOcpiEndpoints.asObservable();
  }

  public getSubjectOcpiEndpoint(): Observable<SingleChangeNotification> {
    return this.subjectOcpiEndpoint.asObservable();
  }

  public getSubjectAnalyticsLinks(): Observable<ChangeNotification> {
    return this.subjectAnalyticsLinks.asObservable();
  }

  public getSubjectAssets(): Observable<ChangeNotification> {
    return this.subjectAssets.asObservable();
  }

  public getSubjectAsset(): Observable<SingleChangeNotification> {
    return this.subjectAsset.asObservable();
  }

  public getSubjectRegistrationTokens(): Observable<ChangeNotification> {
    return this.subjectRegistrationTokens.asObservable();
  }

  public getSubjectRegistrationToken(): Observable<SingleChangeNotification> {
    return this.subjectRegistrationToken.asObservable();
  }

  public getSubjectInvoices(): Observable<ChangeNotification> {
    return this.subjectInvoices.asObservable();
  }

  public getSubjectInvoice(): Observable<SingleChangeNotification> {
    return this.subjectInvoice.asObservable();
  }

  public getSubjectChargingProfiles(): Observable<ChangeNotification> {
    return this.subjectChargingProfiles.asObservable();
  }

  public getSubjectChargingProfile(): Observable<SingleChangeNotification> {
    return this.subjectChargingProfile.asObservable();
  }

  public getSubjectCars(): Observable<ChangeNotification> {
    return this.subjectCars.asObservable();
  }

  public getSubjectCar(): Observable<SingleChangeNotification> {
    return this.subjectCar.asObservable();
  }

  public getSubjectCarCatalogs(): Observable<ChangeNotification> {
    return this.subjectCarCatalogs.asObservable();
  }

  public getSubjectCarCatalog(): Observable<SingleChangeNotification> {
    return this.subjectCarCatalog.asObservable();
  }

  public initSocketIO(token: string) {
    // Check
    if (!this.socketIOClient) {
      // Init Socket IO singleton
      this.socketIOClient = SocketIOClient.getInstance();
    }
    // Connect Socket IO
    this.socketIOClient.connectAuthenticated(this.centralRestServerServiceURL, token);
    this.monitorChangeNotification();
  }

  private monitorChangeNotification() {
    // Monitor Companies
    this.socketIOClient.socket.on(Entity.COMPANIES, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectCompanies.next(changeNotification);
    });

    // Monitor Company
    this.socketIOClient.socket.on(Entity.COMPANY, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectCompany.next(singleChangeNotification);
    });

    // Monitor Tenants
    this.socketIOClient.socket.on(Entity.TENANTS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectTenants.next(changeNotification);
    });

    // Monitor Tenant
    this.socketIOClient.socket.on(Entity.TENANT, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectTenant.next(singleChangeNotification);
    });

    // Monitor OCPI Endpoints
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINTS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectOcpiEndpoints.next(changeNotification);
    });

    // Monitor OCPI Endpoint
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINT, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectOcpiEndpoint.next(singleChangeNotification);
    });

    // Monitor Sites
    this.socketIOClient.socket.on(Entity.SITES, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectSites.next(changeNotification);
    });

    // Monitor Site
    this.socketIOClient.socket.on(Entity.SITE, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectSite.next(singleChangeNotification);
    });

    // Monitor Site Areas
    this.socketIOClient.socket.on(Entity.SITE_AREAS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectSiteAreas.next(changeNotification);
    });

    // Monitor Site Area
    this.socketIOClient.socket.on(Entity.SITE_AREA, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectSiteArea.next(singleChangeNotification);
    });

    // Monitor Users
    this.socketIOClient.socket.on(Entity.USERS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectUsers.next(changeNotification);
    });

    // Monitor User
    this.socketIOClient.socket.on(Entity.USER, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectUser.next(singleChangeNotification);
    });

    // Monitor Transactions
    this.socketIOClient.socket.on(Entity.TRANSACTIONS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectTransactions.next(changeNotification);
    });

    // Monitor Transaction
    this.socketIOClient.socket.on(Entity.TRANSACTION, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectTransaction.next(singleChangeNotification);
    });

    // Monitor Charging Stations
    this.socketIOClient.socket.on(Entity.CHARGING_STATIONS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectChargingStations.next(changeNotification);
    });

    // Monitor Charging Station
    this.socketIOClient.socket.on(Entity.CHARGING_STATION, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectChargingStation.next(singleChangeNotification);
    });

    // Monitor Logging
    this.socketIOClient.socket.on(Entity.LOGGINGS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectLoggings.next(changeNotification);
    });

    // Monitor Assets
    this.socketIOClient.socket.on(Entity.ASSETS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectAssets.next(changeNotification);
    });

    // Monitor Asset
    this.socketIOClient.socket.on(Entity.ASSET, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectAsset.next(singleChangeNotification);
    });

    // Monitor Registration Tokens
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKENS, (changeNotification: ChangeNotification) => {
      this.subjectRegistrationTokens.next(changeNotification);
    });

    // Monitor Registration Token
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKEN, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectRegistrationToken.next(singleChangeNotification);
    });

    // Monitor Invoices
    this.socketIOClient.socket.on(Entity.INVOICES, (changeNotification: ChangeNotification) => {
      this.subjectInvoices.next(changeNotification);
    });

    // Monitor Invoice
    this.socketIOClient.socket.on(Entity.INVOICE, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectInvoice.next(singleChangeNotification);
    });

    // Monitor Charging Profiles
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILES, (changeNotification: ChangeNotification) => {
      this.subjectChargingProfiles.next(changeNotification);
    });

    // Monitor Charging Profile
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILE, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectChargingProfile.next(singleChangeNotification);
    });

    // Monitor Cars
    this.socketIOClient.socket.on(Entity.CARS, (changeNotification: ChangeNotification) => {
      this.subjectCars.next(changeNotification);
    });

    // Monitor Car
    this.socketIOClient.socket.on(Entity.CAR, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectCar.next(singleChangeNotification);
    });

    // Monitor Car Catalogs
    this.socketIOClient.socket.on(Entity.CAR_CATALOGS, (changeNotification: ChangeNotification) => {
      this.subjectCars.next(changeNotification);
    });

    // Monitor Car Catalog
    this.socketIOClient.socket.on(Entity.CAR_CATALOG, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectCar.next(singleChangeNotification);
    });
  }

  public resetSocketIO() {
    // Check: Socket IO not initialized and user logged in
    if (this.socketIOClient) {
      // Close
      this.socketIOClient.disconnect();
    } else {
      console.log('Socket IO not initialized and user logged in');
    }
    // Clear
    this.socketIOClient = null;
  }
}
