import { Injectable } from '@angular/core';
import { Entity } from 'app/types/Authorization';
import { Observable, Subject } from 'rxjs';
import * as io from 'socket.io-client';

import ChangeNotification from '../types/ChangeNotification';
import SingleChangeNotification from '../types/SingleChangeNotification';

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
  private socket: SocketIOClient.Socket;

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

  public getSubjectAnalyticsLinks(): Observable<ChangeNotification> {
    return this.subjectAnalyticsLinks.asObservable();
  }

  public getSubjectOcpiEndpoint(): Observable<SingleChangeNotification> {
    return this.subjectOcpiEndpoint.asObservable();
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
    if (!this.socket && token) {
      // Init and connect Socket IO
      this.socket = io(this.centralRestServerServiceURL, {
        query: 'token=' + token,
      });
    } else {
      // Connect Socket IO
      this.socket.connect();
    }
    // Temporary debug log
    this.socket.on('reconnecting', (attempt) => { console.log(`SocketIO client #${attempt} try to reconnect`); });
    this.socket.on('reconnect_error', (error) => { console.log(`SocketIO client reconnect error: ${error}`); });
    this.monitorChangeNotification();
  }

  private monitorChangeNotification() {
    // Monitor Companies
    this.socket.on(Entity.COMPANIES, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectCompanies.next(changeNotification);
    });

    // Monitor Company
    this.socket.on(Entity.COMPANY, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectCompany.next(singleChangeNotification);
    });

    // Monitor Tenants
    this.socket.on(Entity.TENANTS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectTenants.next(changeNotification);
    });

    // Monitor Tenant
    this.socket.on(Entity.TENANT, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectTenant.next(singleChangeNotification);
    });

    // Monitor Sites
    this.socket.on(Entity.SITES, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectSites.next(changeNotification);
    });

    // Monitor Site
    this.socket.on(Entity.SITE, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectSite.next(singleChangeNotification);
    });

    // Monitor Site Areas
    this.socket.on(Entity.SITE_AREAS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectSiteAreas.next(changeNotification);
    });

    // Monitor Site Area
    this.socket.on(Entity.SITE_AREA, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectSiteArea.next(singleChangeNotification);
    });

    // Monitor Users
    this.socket.on(Entity.USERS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectUsers.next(changeNotification);
    });

    // Monitor User
    this.socket.on(Entity.USER, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectUser.next(singleChangeNotification);
    });

    // Monitor Transactions
    this.socket.on(Entity.TRANSACTIONS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectTransactions.next(changeNotification);
    });

    // Monitor Transaction
    this.socket.on(Entity.TRANSACTION, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectTransaction.next(singleChangeNotification);
    });

    // Monitor Charging Stations
    this.socket.on(Entity.CHARGING_STATIONS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectChargingStations.next(changeNotification);
    });

    // Monitor Charging Station
    this.socket.on(Entity.CHARGING_STATION, (singleChangeNotification: SingleChangeNotification) => {
      // Notify
      this.subjectChargingStation.next(singleChangeNotification);
    });

    // Monitor Logging
    this.socket.on(Entity.LOGGINGS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectLoggings.next(changeNotification);
    });

    // Monitor Assets
    this.socket.on(Entity.ASSETS, (changeNotification: ChangeNotification) => {
      // Notify
      this.subjectAssets.next(changeNotification);
    });

    // Monitor Asset
    this.socket.on(Entity.ASSET, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectAsset.next(singleChangeNotification);
    });

    // Monitor Registration Tokens
    this.socket.on(Entity.REGISTRATION_TOKENS, (changeNotification: ChangeNotification) => {
      this.subjectRegistrationTokens.next(changeNotification);
    });

     // Monitor Registration Token
    this.socket.on(Entity.REGISTRATION_TOKEN, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectRegistrationToken.next(singleChangeNotification);
    });

     // Monitor Invoices
    this.socket.on(Entity.INVOICES, (changeNotification: ChangeNotification) => {
      this.subjectInvoices.next(changeNotification);
    });

     // Monitor Invoice
    this.socket.on(Entity.INVOICE, (singleChangeNotification: SingleChangeNotification) => {
      this.subjectInvoice.next(singleChangeNotification);
    });
  }

  public resetSocketIO() {
    // Check: socket not initialized and user logged
    if (this.socket) {
      // Close
      this.socket.disconnect();
      // Clear
      this.socket = null;
    }
  }
}
