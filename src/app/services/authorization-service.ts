import { Injectable } from '@angular/core';
import { User } from '../common.types';
import { Constants } from '../utils/Constants';
import { CentralServerService } from './central-server.service';

@Injectable()
export class AuthorizationService {
  private loggedUser: User;

  constructor(
    private centralServerService: CentralServerService) {

    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      this.loggedUser = user;
    });
  }

  public cleanUserAndUserAuthorization() {
    this.loggedUser = null;
  }

  public canListLogging(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_LOGGINGS, Constants.ACTION_LIST);
  }

  public canListChargingStations(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATIONS,
      Constants.ACTION_LIST);
  }

  public canGetConfigurationChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_GET_CONFIGURATION);
  }

  public canRebootChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_RESET);
  }

  public canClearCacheChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_CLEAR_CACHE);
  }

  public canStartTransactionChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_REMOTE_START_TRANSACTION);
  }

  public canStopTransactionChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_REMOTE_STOP_TRANSACTION);
  }

  public canUnlockConnectorChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_UNLOCK_CONNECTOR);
  }

  public canAccessOnChargingStation(chargingStation, action): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, action);
  }

  public canReadChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_READ);
  }

  public canDeleteChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_DELETE);
  }

  public canUpdateChargingStation(chargingStation): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_CHARGING_STATION, Constants.ACTION_UPDATE);
  }

  public canListCompanies(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_COMPANIES,
      Constants.ACTION_LIST);
  }

  public canReadCompany(company): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_COMPANY, Constants.ACTION_READ);
  }

  public canCreateCompany(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_COMPANY,
      Constants.ACTION_CREATE);
  }

  public canUpdateCompany(company): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_COMPANY, Constants.ACTION_UPDATE);
  }

  public canDeleteCompany(company): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_COMPANY, Constants.ACTION_DELETE);
  }

  public canListSites(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITES,
      Constants.ACTION_LIST);
  }

  public canReadSite(site): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE, Constants.ACTION_READ);
  }

  public canCreateSite(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE,
      Constants.ACTION_CREATE);
  }

  public canUpdateSite(site): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE, Constants.ACTION_UPDATE);
  }

  public canDeleteSite(site): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE, Constants.ACTION_DELETE);
  }

  public canListSiteAreas(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE_AREAS,
      Constants.ACTION_LIST);
  }

  public canReadSiteArea(siteArea): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE_AREA, Constants.ACTION_READ);
  }

  public canCreateSiteArea(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE_AREA,
      Constants.ACTION_CREATE);
  }

  public canUpdateSiteArea(siteArea): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE_AREA, Constants.ACTION_UPDATE);
  }

  public canDeleteSiteArea(siteArea): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SITE_AREA, Constants.ACTION_DELETE);
  }

  public canListUsers(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USERS,
      Constants.ACTION_LIST);
  }

  public canListSettings(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_SETTINGS,
      Constants.ACTION_LIST);
  }

  public canListTransactions(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_TRANSACTIONS,
      Constants.ACTION_LIST);
  }

  public canReadTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canAccess(Constants.ENTITY_TRANSACTION, Constants.ACTION_READ);
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  public canUpdateTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canAccess(Constants.ENTITY_TRANSACTION, Constants.ACTION_UPDATE);
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  public canDeleteTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canAccess(Constants.ENTITY_TRANSACTION, Constants.ACTION_DELETE);
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canRefundTransaction() {
    return this.canAccess(Constants.ENTITY_TRANSACTION,
      Constants.ACTION_REFUND_TRANSACTION);
  }

  public canReadUser(user): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USER, Constants.ACTION_READ);
  }

  public canLogoutUser(user): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USER, Constants.ACTION_LOGOUT);
  }

  public canCreateUser(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USER,
      Constants.ACTION_CREATE);
  }

  public canUpdateUser(user): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USER, Constants.ACTION_UPDATE);
  }

  public canDeleteUser(user): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_USER, Constants.ACTION_DELETE);
  }

  public canListVehicles(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLES,
      Constants.ACTION_LIST);
  }

  public canReadVehicle(vehicle): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE, Constants.ACTION_READ);
  }

  public canCreateVehicle(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE,
      Constants.ACTION_CREATE);
  }

  public canUpdateVehicle(vehicle): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE, Constants.ACTION_UPDATE);
  }

  public canDeleteVehicle(vehicle): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE, Constants.ACTION_DELETE);
  }

  public canListVehicleManufacturers(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE_MANUFACTURERS,
      Constants.ACTION_LIST);
  }

  public canReadVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE_MANUFACTURER, Constants.ACTION_READ);
  }

  public canCreateVehicleManufacturer(): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE_MANUFACTURER,
      Constants.ACTION_CREATE);
  }

  public canUpdateVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE_MANUFACTURER, Constants.ACTION_UPDATE);
  }

  public canDeleteVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canAccess(Constants.ENTITY_VEHICLE_MANUFACTURER, Constants.ACTION_DELETE);
  }

  public canAccess(resource: String, action: String): boolean {
    return this.loggedUser && this.loggedUser.scopes && this.loggedUser.scopes.includes(`${resource}:${action}`);
  }

  public isAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_ADMIN;
    } else {
      return false;
    }
  }

  public isSuperAdmin(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_SUPER_ADMIN;
    } else {
      return false;
    }
  }

  public isBasic(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_BASIC;
    } else {
      return false;
    }
  }

  public isDemo(): boolean {
    if (this.loggedUser) {
      return this.loggedUser.role === Constants.ROLE_DEMO;
    } else {
      return false;
    }
  }
}
