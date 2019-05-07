// var Authorization = require('node-authorization').Authorization;
import {Injectable} from '@angular/core';
import {Authorization} from 'node-authorization';
import {CentralServerService} from './central-server.service';
import {ConfigService} from './config.service';
import {Constants} from '../utils/Constants';
import {User} from '../common.types';

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

  public getAuthorization(): any {
    // Get the logged user
    const currentLoggedUser = this.centralServerService.getLoggedUser();
    // Check
    if (!this.loggedUser || this.loggedUser.id !== currentLoggedUser.id || this.loggedUser.role !== currentLoggedUser.role ) {
      // Keep user
      this.loggedUser = currentLoggedUser;
      // Create Auth
      this.loggedUserAuthorization = new Authorization(currentLoggedUser.role, currentLoggedUser.auths);
    }
    // Create
    return this.loggedUserAuthorization;
  }

  public canListLogging(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_LOGGINGS,
      {'Action': Constants.ACTION_LIST});
  }

  public canListChargingStations(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATIONS,
      {'Action': Constants.ACTION_LIST});
  }

  public canGetConfigurationChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_GET_CONFIGURATION,
        'ChargingStationID': chargingStation.id
      });
  }

  public canRebootChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_RESET,
        'ChargingStationID': chargingStation.id
      });
  }

  public canClearCacheChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_CLEAR_CACHE,
        'ChargingStationID': chargingStation.id
      });
  }

  public canStartTransactionChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_START_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  public canStopTransactionChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_STOP_TRANSACTION,
        'ChargingStationID': chargingStation.id
      });
  }

  public canUnlockConnectorChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_UNLOCK_CONNECTOR,
        'ChargingStationID': chargingStation.id
      });
  }

  public _canPerformActionOnChargingStation(chargingStation, action): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': action,
        'ChargingStationID': chargingStation.id
      });
  }

  public canReadChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_READ,
        'ChargingStationID': chargingStation.id,
      });
  }

  public canDeleteChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_DELETE,
        'ChargingStationID': chargingStation.id,
      });
  }

  public canUpdateChargingStation(chargingStation): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_CHARGING_STATION,
      {
        'Action': Constants.ACTION_UPDATE,
        'ChargingStationID': chargingStation.id,
      });
  }

  public canListCompanies(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_COMPANIES,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadCompany(company): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_READ,
        'CompanyID': company.id
      });
  }

  public canCreateCompany(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_COMPANY,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateCompany(company): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_UPDATE,
        'CompanyID': company.id
      });
  }

  public canDeleteCompany(company): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_COMPANY,
      {
        'Action': Constants.ACTION_DELETE,
        'CompanyID': company.id
      });
  }

  public canListSites(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITES,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadSite(site): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_READ,
        'SiteID': site.id
      });
  }

  public canCreateSite(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateSite(site): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_UPDATE,
        'SiteID': site.id
      });
  }

  public canDeleteSite(site): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE,
      {
        'Action': Constants.ACTION_DELETE,
        'SiteID': site.id
      });
  }

  public canListSiteAreas(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE_AREAS,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadSiteArea(siteArea): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_READ,
        'SiteAreaID': siteArea.id
      });
  }

  public canCreateSiteArea(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE_AREA,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateSiteArea(siteArea): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_UPDATE,
        'SiteAreaID': siteArea.id
      });
  }

  public canDeleteSiteArea(siteArea): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SITE_AREA,
      {
        'Action': Constants.ACTION_DELETE,
        'SiteAreaID': siteArea.id
      });
  }

  public canListUsers(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USERS,
      {'Action': Constants.ACTION_LIST});
  }

  public canListSettings(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_SETTINGS,
      {'Action': Constants.ACTION_LIST});
  }

  public canListTransactions(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_TRANSACTIONS,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this._canPerformAction(Constants.ENTITY_TRANSACTION,
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

  public canUpdateTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this._canPerformAction(Constants.ENTITY_TRANSACTION,
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

  public canDeleteTransaction(transaction): boolean {
    // Check auth
    if (transaction.user) {
      // Check
      return this._canPerformAction(Constants.ENTITY_TRANSACTION,
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

  canRefundTransaction() {
    return this._canPerformAction(Constants.ENTITY_TRANSACTION,
      {'Action': Constants.ACTION_REFUND_TRANSACTION});
  }

  public canReadUser(user): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_READ,
        'UserID': user.id
      });
  }

  public canLogoutUser(user): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_LOGOUT,
        'UserID': user.id
      });
  }

  public canCreateUser(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USER,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateUser(user): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_UPDATE,
        'UserID': user.id
      });
  }

  public canDeleteUser(user): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_USER,
      {
        'Action': Constants.ACTION_DELETE,
        'UserID': user.id
      });
  }

  public canListVehicles(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLES,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadVehicle(vehicle): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_READ,
        'VehicleID': vehicle.id
      });
  }

  public canCreateVehicle(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateVehicle(vehicle): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_UPDATE,
        'VehicleID': vehicle.id
      });
  }

  public canDeleteVehicle(vehicle): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE,
      {
        'Action': Constants.ACTION_DELETE,
        'VehicleID': vehicle.id
      });
  }

  public canListVehicleManufacturers(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURERS,
      {'Action': Constants.ACTION_LIST});
  }

  public canReadVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_READ,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  public canCreateVehicleManufacturer(): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {'Action': Constants.ACTION_CREATE});
  }

  public canUpdateVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_UPDATE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  public canDeleteVehicleManufacturer(vehicleManufacturer): boolean {
    // Check
    return this._canPerformAction(Constants.ENTITY_VEHICLE_MANUFACTURER,
      {
        'Action': Constants.ACTION_DELETE,
        'VehicleManufacturerID': vehicleManufacturer.id
      });
  }

  public canAccess(entity: String, action: String): boolean {
    return this._canPerformAction(entity,
      {
        'Action': action
      });
  }

  public isAdmin(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_ADMIN;
  }

  public isSuperAdmin(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_SUPER_ADMIN;
  }

  public isBasic(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_BASIC;
  }

  public isDemo(): boolean {
    return this.centralServerService.getLoggedUser().role === Constants.ROLE_DEMO;
  }

  private _canPerformAction(entity, fieldNamesValues): boolean {
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
