// var Authorization = require('node-authorization').Authorization;
import { Injectable } from '@angular/core';
import { Authorization } from 'node-authorization';
import { CentralServerService } from './central-server.service';
import { ConfigService } from './config.service';
import { Constants } from '../utils/Constants';
import { User } from '../common.types';

@Injectable()
export class AuthorizationService {
  private loggedUser: User;
  private loggedUserAuthorization: Authorization;
  private authorizationConfig;

  constructor(
      private centralServerService: CentralServerService,
      private config: ConfigService) {
    // Get config
    this.authorizationConfig = config.getAuthorization();
    // Check
    if (this.authorizationConfig.debug) {
      // Debug on
      Authorization.switchTraceOn();
    }
  }

  getAuthorization(): any {
    // Get the logged user
    const currentLoggedUser = this.centralServerService.getLoggedUser();
    // Check
    if (!this.loggedUser || this.loggedUser.id !== currentLoggedUser.id) {
      // Keep user
      this.loggedUser = currentLoggedUser;
      // Create Auth
      this.loggedUserAuthorization = new Authorization(currentLoggedUser.role, currentLoggedUser.auths);
    }
    // Create
    return this.loggedUserAuthorization;
  }

  canListLogging(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_LOGGINGS,
      { 'Action': Constants.ACTION_LIST });
  }

  canListChargingStations(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATIONS,
      { 'Action': Constants.ACTION_LIST });
  }

  canGetConfigurationChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_GET_CONFIGURATION,
        'ChargingStationID': chargingStation.id
      });
  }

  canRebootChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_RESET,
        'ChargingStationID': chargingStation.id
      });
  }

  canClearCacheChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_CLEAR_CACHE,
        'ChargingStationID': chargingStation.id
      });
  }

  canStartTransactionChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_START_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  canStopTransactionChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_STOP_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  canUnlockConnectorChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_UNLOCK_CONNECTOR,
        'ChargingStationID': chargingStation.id
      });
  }

  canPerformActionOnChargingStation(chargingStation, action): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': action,
        'ChargingStationID': chargingStation.id
      });
  }

  canReadChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_READ,
        'ChargingStationID': chargingStation.id,
      });
  }

  canDeleteChargingStation(chargingStation): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_DELETE,
        'ChargingStationID': chargingStation.id,
      });
  }

  canListCompanies(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_COMPANIES,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadCompany(company): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_READ,
        'CompanyID': company.id
      });
  }

  canCreateCompany(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_COMPANY,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateCompany(company): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_UPDATE,
        'CompanyID': company.id
      });
  }

  canDeleteCompany(company): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_DELETE,
        'CompanyID': company.id
      });
  }

  canListSites(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITES,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadSite(site): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_READ,
        'SiteID': site.id
      });
  }

  canCreateSite(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateSite(site): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_UPDATE,
        'SiteID': site.id
      });
  }

  canDeleteSite(site): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_DELETE,
        'SiteID': site.id
      });
  }

  canListSiteAreas(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE_AREAS,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadSiteArea(siteArea): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_READ,
        'SiteAreaID': siteArea.id
      });
  }

  canCreateSiteArea(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE_AREA,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateSiteArea(siteArea): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_UPDATE,
        'SiteAreaID': siteArea.id
      });
  }

  canDeleteSiteArea(siteArea): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_DELETE,
        'SiteAreaID': siteArea.id
      });
  }

  canListUsers(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USERS,
      { 'Action': Constants.ACTION_LIST });
  }

  canListTransactions(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_TRANSACTIONS,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(Constants.ENTITY_TRANSACTION,
        {
          'Action': Constants.ACTION_READ,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canUpdateTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(Constants.ENTITY_TRANSACTION,
        {
          'Action': Constants.ACTION_UPDATE,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canDeleteTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(Constants.ENTITY_TRANSACTION,
        {
          'Action': Constants.ACTION_DELETE,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canReadUser(user): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_READ,
        'UserID': user.id
      });
  }

  canLogoutUser(user): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_LOGOUT,
        'UserID': user.id
      });
  }

  canCreateUser(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USER,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateUser(user): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_UPDATE,
        'UserID': user.id
      });
  }

  canDeleteUser(user): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_DELETE,
        'UserID': user.id
      });
  }

  canListVehicles(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLES,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadVehicle(vehicle): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_READ,
        'VehicleID': vehicle.id
      });
  }

  canCreateVehicle(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateVehicle(vehicle): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_UPDATE,
        'VehicleID': vehicle.id
      });
  }

  canDeleteVehicle(vehicle): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_DELETE,
        'VehicleID': vehicle.id
      });
  }

  canListVehicleManufacturers(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURERS,
      { 'Action': Constants.ACTION_LIST });
  }

  canReadVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_READ,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  canCreateVehicleManufacturer(): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      { 'Action': Constants.ACTION_CREATE });
  }

  canUpdateVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_UPDATE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  canDeleteVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this.canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_DELETE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  isAdmin(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_ADMIN;
  }

  isBasic(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_BASIC;
  }

  isDemo(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_DEMO;
  }

  canPerformAction(entity, fieldNamesValues): boolean {
    // Create Auth
    const auth = this.getAuthorization();
    // Check
    if (auth.check(entity, fieldNamesValues)) {
      // Authorized!
      return true;
    } else {
      return false;
    }
  }
}
