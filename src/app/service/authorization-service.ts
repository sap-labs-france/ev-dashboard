// var Authorization = require('node-authorization').Authorization;
import { Injectable } from '@angular/core';
import { Authorization } from 'node-authorization';
import { CentralServerService } from '../service/central-server.service';
import { ConfigService } from '../service/config.service';
import { AuthorizationConstants } from './authorization-constants';
import { User } from '../model/user';

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

  getAuthorization() {
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

  canListLogging() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_LOGGINGS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canListChargingStations() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATIONS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canGetConfigurationChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_GET_CONFIGURATION,
        'ChargingStationID': chargingStation.id
      });
  }

  canRebootChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_RESET,
        'ChargingStationID': chargingStation.id
      });
  }

  canClearCacheChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_CLEAR_CACHE,
        'ChargingStationID': chargingStation.id
      });
  }

  canStartTransactionChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_START_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  canStopTransactionChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_STOP_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  canUnlockConnectorChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_UNLOCK_CONNECTOR,
        'ChargingStationID': chargingStation.id
      });
  }

  canPerformActionOnChargingStation(chargingStation, action) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': action,
        'ChargingStationID': chargingStation.id
      });
  }

  canReadChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'ChargingStationID': chargingStation.id,
      });
  }

  canDeleteChargingStation(chargingStation) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_CHARGING_STATION,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'ChargingStationID': chargingStation.id,
      });
  }

  canListCompanies() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_COMPANIES,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadCompany(company) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_COMPANY,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'CompanyID': company.id
      });
  }

  canCreateCompany() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_COMPANY,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateCompany(company) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_COMPANY,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'CompanyID': company.id
      });
  }

  canDeleteCompany(company) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_COMPANY,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'CompanyID': company.id
      });
  }

  canListSites() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITES,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadSite(site) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'SiteID': site.id
      });
  }

  canCreateSite() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateSite(site) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'SiteID': site.id
      });
  }

  canDeleteSite(site) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'SiteID': site.id
      });
  }

  canListSiteAreas() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE_AREAS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadSiteArea(siteArea) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE_AREA,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'SiteAreaID': siteArea.id
      });
  }

  canCreateSiteArea() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE_AREA,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateSiteArea(siteArea) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE_AREA,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'SiteAreaID': siteArea.id
      });
  }

  canDeleteSiteArea(siteArea) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_SITE_AREA,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'SiteAreaID': siteArea.id
      });
  }

  canListUsers() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USERS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canListTransactions() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_TRANSACTIONS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadTransaction(transaction) {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(AuthorizationConstants.ENTITY_TRANSACTION,
        {
          'Action': AuthorizationConstants.ACTION_READ,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canUpdateTransaction(transaction) {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(AuthorizationConstants.ENTITY_TRANSACTION,
        {
          'Action': AuthorizationConstants.ACTION_UPDATE,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canDeleteTransaction(transaction) {
    // Check auth
    if (transaction.user) {
      // Check
      return this.canPerformAction(AuthorizationConstants.ENTITY_TRANSACTION,
        {
          'Action': AuthorizationConstants.ACTION_DELETE,
          'UserID': transaction.user.id
        });
      // Admin?
    } else if (!this.isAdmin()) {
      return false;
    }
    return true;
  }

  canReadUser(user) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USER,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'UserID': user.id
      });
  }

  canLogoutUser(user) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USER,
      {
        'Action': AuthorizationConstants.ACTION_LOGOUT,
        'UserID': user.id
      });
  }

  canCreateUser() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USER,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateUser(user) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USER,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'UserID': user.id
      });
  }

  canDeleteUser(user) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_USER,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'UserID': user.id
      });
  }

  canListVehicles() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLES,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadVehicle(vehicle) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'VehicleID': vehicle.id
      });
  }

  canCreateVehicle() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateVehicle(vehicle) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'VehicleID': vehicle.id
      });
  }

  canDeleteVehicle(vehicle) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'VehicleID': vehicle.id
      });
  }

  canListVehicleManufacturers() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE_MANUFACTURERS,
      { 'Action': AuthorizationConstants.ACTION_LIST });
  }

  canReadVehicleManufacturer(vehicleManufacturer) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': AuthorizationConstants.ACTION_READ,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  canCreateVehicleManufacturer() {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE_MANUFACTURER,
      { 'Action': AuthorizationConstants.ACTION_CREATE });
  }

  canUpdateVehicleManufacturer(vehicleManufacturer) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': AuthorizationConstants.ACTION_UPDATE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  canDeleteVehicleManufacturer(vehicleManufacturer) {
    // Check
    return this.canPerformAction(AuthorizationConstants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': AuthorizationConstants.ACTION_DELETE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  isAdmin() {
    return this.centralServerService.getLoggedUser().role === AuthorizationConstants.ROLE_ADMIN;
  }

  isBasic() {
    return this.centralServerService.getLoggedUser().role === AuthorizationConstants.ROLE_BASIC;
  }

  isCorporate() {
    return this.centralServerService.getLoggedUser().role === AuthorizationConstants.ROLE_CORPORATE;
  }

  isDemo() {
    return this.centralServerService.getLoggedUser().role === AuthorizationConstants.ROLE_DEMO;
  }

  canPerformAction(entity, fieldNamesValues) {
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
