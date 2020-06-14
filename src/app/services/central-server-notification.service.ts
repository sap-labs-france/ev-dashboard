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

  private monitorChangeNotification() {
    console.log('Socket IO - monitorChangeNotification() is called');
    // Monitor Companies
    this.socketIOClient.socket.on(Entity.COMPANIES, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.COMPANIES}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCompanies.next(changeNotification);
    });
    // Monitor Company
    this.socketIOClient.socket.on(Entity.COMPANY, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.COMPANY}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCompany.next(changeNotification);
    });
    // Monitor Tenants
    this.socketIOClient.socket.on(Entity.TENANTS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.TENANTS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectTenants.next(changeNotification);
    });
    // Monitor Tenant
    this.socketIOClient.socket.on(Entity.TENANT, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.TENANT}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectTenant.next(changeNotification);
    });
    // Monitor OCPI Endpoints
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINTS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.OCPI_ENDPOINTS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectOcpiEndpoints.next(changeNotification);
    });
    // Monitor OCPI Endpoint
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINT, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.OCPI_ENDPOINT}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectOcpiEndpoint.next(changeNotification);
    });
    // Monitor Sites
    this.socketIOClient.socket.on(Entity.SITES, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.SITES}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectSites.next(changeNotification);
    });
    // Monitor Site
    this.socketIOClient.socket.on(Entity.SITE, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.SITE}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectSite.next(changeNotification);
    });
    // Monitor Site Areas
    this.socketIOClient.socket.on(Entity.SITE_AREAS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.SITE_AREAS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectSiteAreas.next(changeNotification);
    });
    // Monitor Site Area
    this.socketIOClient.socket.on(Entity.SITE_AREA, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.SITE_AREA}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectSiteArea.next(changeNotification);
    });
    // Monitor Users
    this.socketIOClient.socket.on(Entity.USERS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.USERS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectUsers.next(changeNotification);
    });
    // Monitor User
    this.socketIOClient.socket.on(Entity.USER, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.USER}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectUser.next(changeNotification);
    });
    // Monitor Transactions
    this.socketIOClient.socket.on(Entity.TRANSACTIONS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.TRANSACTIONS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectTransactions.next(changeNotification);
    });
    // Monitor Transaction
    this.socketIOClient.socket.on(Entity.TRANSACTION, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.TRANSACTION}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectTransaction.next(changeNotification);
    });
    // Monitor Charging Stations
    this.socketIOClient.socket.on(Entity.CHARGING_STATIONS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CHARGING_STATIONS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectChargingStations.next(changeNotification);
    });
    // Monitor Charging Station
    this.socketIOClient.socket.on(Entity.CHARGING_STATION, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CHARGING_STATION}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectChargingStation.next(changeNotification);
    });
    // Monitor Logging
    this.socketIOClient.socket.on(Entity.LOGGINGS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.LOGGINGS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectLoggings.next(changeNotification);
    });
    // Monitor Assets
    this.socketIOClient.socket.on(Entity.ASSETS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.ASSETS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectAssets.next(changeNotification);
    });
    // Monitor Asset
    this.socketIOClient.socket.on(Entity.ASSET, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.ASSET}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectAsset.next(changeNotification);
    });
    // Monitor Registration Tokens
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKENS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.REGISTRATION_TOKENS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectRegistrationTokens.next(changeNotification);
    });
    // Monitor Registration Token
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKEN, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.REGISTRATION_TOKEN}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectRegistrationToken.next(changeNotification);
    });
    // Monitor Invoices
    this.socketIOClient.socket.on(Entity.INVOICES, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.INVOICES}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectInvoices.next(changeNotification);
    });
    // Monitor Invoice
    this.socketIOClient.socket.on(Entity.INVOICE, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.INVOICE}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectInvoice.next(changeNotification);
    });
    // Monitor Charging Profiles
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILES, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CHARGING_PROFILES}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectChargingProfiles.next(changeNotification);
    });
    // Monitor Charging Profile
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILE, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CHARGING_PROFILE}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectChargingProfile.next(changeNotification);
    });
    // Monitor Cars
    this.socketIOClient.socket.on(Entity.CARS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CARS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCars.next(changeNotification);
    });
    // Monitor Car
    this.socketIOClient.socket.on(Entity.CAR, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CAR}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCar.next(changeNotification);
    });
    // Monitor Car Catalogs
    this.socketIOClient.socket.on(Entity.CAR_CATALOGS, (changeNotification: ChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CAR_CATALOGS}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCars.next(changeNotification);
    });
    // Monitor Car Catalog
    this.socketIOClient.socket.on(Entity.CAR_CATALOG, (changeNotification: SingleChangeNotification) => {
      console.log(`SocketIO received event '${Entity.CAR_CATALOG}' with data: ${JSON.stringify(changeNotification)}`);
      this.subjectCar.next(changeNotification);
    });
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

  public resetSocketIO() {
    // Check: Socket IO not initialized and user logged in
    if (this.socketIOClient) {
      // Close
      this.socketIOClient.disconnect();
    } else {
      console.log('SocketIO client not initialized and user logged in');
    }
    // Clear
    this.socketIOClient = null;
  }
}
