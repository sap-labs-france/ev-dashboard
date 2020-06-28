import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Data, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from 'app/services/dialog.service';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { Address } from 'app/types/Address';
import { Car, CarCatalog, CarConverter, CarType } from 'app/types/Car';
import { ChargePoint, ChargingStation, ChargingStationPowers, Connector, CurrentType, StaticLimitAmps } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { MobileType } from 'app/types/Mobile';
import { ButtonType } from 'app/types/Table';
import { User, UserCar, UserToken } from 'app/types/User';
import { BAD_REQUEST, CONFLICT, FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import * as moment from 'moment';

import { CentralServerService } from '../services/central-server.service';
import { MessageService } from '../services/message.service';

export class Utils {
  public static isEmptyArray(array: any[]): boolean {
    if (Array.isArray(array) && array.length > 0) {
      return false;
    }
    return true;
  }

  public static registerCloseKeyEvents(dialogRef: MatDialogRef<any>) {
    // listen to keystroke
    dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents && keydownEvents.code === 'Escape') {
        dialogRef.close();
      }
    });
  }

  public static registerValidateCloseKeyEvents(dialogRef: MatDialogRef<any>,
     validate: () => void, close: () => void) {
    // listen to keystroke
    dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents && keydownEvents.code === 'Escape') {
        dialogRef.close();
      }
      if (keydownEvents && keydownEvents.code === 'Enter') {
        validate();
      }
    });
  }

  public static registerSaveCloseKeyEvents(dialogRef: MatDialogRef<any>, formGroup: FormGroup,
      save: (data: Data) => void, close: () => void) {
    // listen to keystroke
    dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents && keydownEvents.code === 'Escape') {
        close();
      }
      if (keydownEvents && keydownEvents.code === 'Enter') {
        if (formGroup.valid && formGroup.dirty) {
          // tslint:disable-next-line: no-unsafe-any
          save(formGroup.getRawValue());
        }
      }
    });
  }

  public static checkAndSaveAndCloseDialog(formGroup: FormGroup, dialogService: DialogService,
      translateService: TranslateService, save: (data: Data) => void, closeDialog: (saved: boolean) => void) {
    if (formGroup.invalid && formGroup.dirty) {
      dialogService.createAndShowInvalidChangeCloseDialog(
        translateService.instant('general.change_invalid_pending_title'),
        translateService.instant('general.change_invalid_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          closeDialog(false);
        }
      });
    } else if (formGroup.dirty) {
      dialogService.createAndShowDirtyChangeCloseDialog(
        translateService.instant('general.change_pending_title'),
        translateService.instant('general.change_pending_text'),
      ).subscribe((result) => {
        if (result === ButtonType.SAVE_AND_CLOSE) {
          save(formGroup.getRawValue());
        } else if (result === ButtonType.DO_NOT_SAVE_AND_CLOSE) {
          closeDialog(false);
        }
      });
    } else {
      closeDialog(false);
    }
  }

  public static containsAddressGPSCoordinates(address: Address): boolean {
    // Check if GPS are available
    if (address && Utils.containsGPSCoordinates(address.coordinates)) {
      return true;
    }
    return false;
  }

  public static containsGPSCoordinates(coordinates: number[]): boolean {
    // Check if GPs are available
    if (coordinates && coordinates.length === 2 && coordinates[0] && coordinates[1]) {
      return true;
    }
    return false;
  }

  public static cloneJSonDocument(jsonDocument: object): object {
    return JSON.parse(JSON.stringify(jsonDocument));
  }

  public static validateEqual(formGroup: FormGroup, firstField: string, secondField: string) {
    const field1: FormControl = formGroup.controls[firstField] as FormControl;
    const field2: FormControl = formGroup.controls[secondField] as FormControl;

    // Null?
    if (!field1.value && !field2.value) {
      return null;
    }
    // Equals
    if (field1.value === field2.value) {
      return null;
    }
    // Not Equal
    return { notEqual: true };
  }

  public static toRgba(rgb: string, alpha: number): string {
    if (!rgb) {
      return '';
    }
    let rgba = rgb.replace(/rgb/i, 'rgba');
    rgba = rgba.replace(/\)/i, `,${alpha})`);
    return rgba;
  }

  public static objectHasProperty(object: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  public static formatBarColor(color: string): any {
    return {
      backgroundColor: Utils.toRgba(color, 1),
      borderColor: Utils.toRgba(color, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: Utils.toRgba(color, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: Utils.toRgba(color, 0.8),
      hoverBorderColor: Utils.toRgba(color, 1),
    };
  }

  public static firstLetterInUpperCase(value: string): string {
    return value[0].toUpperCase() + value.substring(1);
  }

  public static formatLineColor(color: string): any {
    return {
      backgroundColor: Utils.toRgba(color, 0.2),
      borderColor: Utils.toRgba(color, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: Utils.toRgba(color, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: Utils.toRgba(color, 0.8),
      hoverBorderColor: Utils.toRgba(color, 1),
    };
  }

  public static handleError(error: any, messageService: MessageService, errorMessage: string = '', params?: object) {
    console.log(`Error: ${errorMessage}: ${error}`);
    messageService.showErrorMessage(errorMessage, params);
  }

  public static isInMobileApp(): boolean {
    return Utils.getMobileVendor() !== null;
  }

  public static replaceSpecialCharsInCSVValueParam(value: string): string {
    return value ? value.replace(/\n/g, '') : '';
  }

  public static getChargingStationPowers(chargingStation: ChargingStation,
      chargePoint?: ChargePoint, connectorId = 0, forChargingProfile: boolean = false): ChargingStationPowers {
    const numberOfPhases = Utils.getNumberOfConnectedPhases(chargingStation, chargePoint, connectorId);
    const numberOfConnectors = chargePoint ? chargePoint.connectorIDs.length : chargingStation.connectors.length;
    const result: ChargingStationPowers = {
      notSupported: false,
      minAmp: StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors,
      minWatt: Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId,
        StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors),
      maxAmp: StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors,
      maxWatt: Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId,
        StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors),
      currentAmp: 0,
      currentWatt: 0,
    };
    // Check
    if (!chargingStation ||
        !chargingStation.connectors ||
        Utils.isEmptyArray(chargingStation.connectors)) {
      result.notSupported = true;
      result.currentAmp = result.maxAmp;
      result.currentWatt = Utils.convertAmpToWatt(
        chargingStation, chargePoint, connectorId, result.currentAmp);
      return result;
    }
    // Use Limit Amps
    if (forChargingProfile) {
      result.maxAmp = Utils.getChargingStationAmperageLimit(chargingStation, chargePoint, connectorId);
    } else {
      result.currentAmp = Utils.getChargingStationAmperageLimit(chargingStation, chargePoint, connectorId);
      result.maxAmp = Utils.getChargingStationAmperage(chargingStation, chargePoint, connectorId);
    }
    // Default
    if (result.currentAmp === 0) {
      result.currentAmp = result.maxAmp;
    }
    result.minWatt = Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, result.minAmp);
    result.maxWatt = Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, result.maxAmp);
    result.currentWatt = Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, result.currentAmp);
    return result;
  }

  public static sortArrayOfKeyValue(element1: KeyValue, element2: KeyValue) {
    if (element1.value < element2.value) {
      return -1;
    }
    if (element1.value > element2.value) {
      return 1;
    }
    return 0;
  }

  public static computeStaticLimitAmpSteps(chargingStation: ChargingStation, chargePoint: ChargePoint): number {
    if (chargingStation && chargePoint) {
      const numberOfPhases = Utils.getNumberOfConnectedPhases(chargingStation, chargePoint, 0);
      if (numberOfPhases > 0) {
        return numberOfPhases * chargePoint.connectorIDs.length;
      }
    }
    return 6;
  }

  public static convertAmpToWatt(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorID = 0, ampValue: number): number {
    const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorID);
    if (voltage) {
      return voltage * ampValue;
    }
    return 0;
  }

  public static convertWattToAmp(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorID = 0, wattValue: number): number {
    const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorID);
    if (voltage) {
      return Math.floor(wattValue / voltage);
    }
    return 0;
  }

  public static getChargePointFromID(chargingStation: ChargingStation, chargePointID: number): ChargePoint {
    if (!chargingStation.chargePoints) {
      return null;
    }
    return chargingStation.chargePoints.find((chargePoint) => chargePoint && (chargePoint.chargePointID === chargePointID));
  }

  public static getConnectorFromID(chargingStation: ChargingStation, connectorID: number): Connector {
    if (!chargingStation.connectors) {
      return null;
    }
    return chargingStation.connectors.find((connector) => connector && (connector.connectorId === connectorID));
  }

  public static computeChargingStationTotalAmps(chargingStation: ChargingStation): number {
    let totalAmps = 0;
    if (chargingStation) {
      // Check at Charging Station
      if (chargingStation.maximumPower) {
        return Utils.convertWattToAmp(chargingStation, null, 0, chargingStation.maximumPower);
      }
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePoint of chargingStation.chargePoints) {
          totalAmps += chargePoint.amperage;
        }
      }
      // Check at connector level
      if (totalAmps === 0 && chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          totalAmps += connector.amperage;
        }
      }
    }
    return totalAmps;
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public static getChargingStationPower(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorId = 0): number {
    let totalPower = 0;
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.power) {
              totalPower += chargePointOfCS.power;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.power) {
              if (chargePointOfCS.cannotChargeInParallel || chargePointOfCS.sharePowerToAllConnectors) {
                // Check Connector ID
                const connector = Utils.getConnectorFromID(chargingStation, connectorId);
                if (connector.power) {
                  return connector.power;
                }
                return chargePointOfCS.power;
              }
              // Power is shared evenly on connectors
              return chargePointOfCS.power / chargePointOfCS.connectorIDs.length;
            }
          }
        }
      }
      // Check at connector level
      if (totalPower === 0 && chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          if (connectorId === 0 && connector.power) {
            totalPower += connector.power;
          }
          if (connector.connectorId === connectorId && connector.power) {
            return connector.power;
          }
        }
      }
    }
    if (!totalPower) {
      const amperage = Utils.getChargingStationAmperage(chargingStation, chargePoint, connectorId);
      const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorId);
      if (voltage && amperage) {
        return voltage * amperage;
      }
    }
    return totalPower;
  }

  public static getNumberOfConnectedPhases(chargingStation: ChargingStation, chargePoint?: ChargePoint, connectorId = 0): number {
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.numberOfConnectedPhase) {
              return chargePointOfCS.numberOfConnectedPhase;
            }
            // Connector
            if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.numberOfConnectedPhase) {
              // Check Connector ID
              const connector = Utils.getConnectorFromID(chargingStation, connectorId);
              if (connector.numberOfConnectedPhase) {
                return connector.numberOfConnectedPhase;
              }
              return chargePointOfCS.numberOfConnectedPhase;
            }
          }
        }
      }
      // Check at connector level
      if (chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          // Take the first
          if (connectorId === 0 && connector.numberOfConnectedPhase) {
            return connector.numberOfConnectedPhase;
          }
          if (connector.connectorId === connectorId && connector.numberOfConnectedPhase) {
            return connector.numberOfConnectedPhase;
          }
        }
      }
    }
    return 1;
  }

  public static getChargingStationVoltage(chargingStation: ChargingStation, chargePoint?: ChargePoint, connectorId = 0): number {
    if (chargingStation) {
      // Check at charging station level
      if (chargingStation.voltage) {
        return chargingStation.voltage;
      }
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.voltage) {
              return chargePointOfCS.voltage;
            }
            // Connector
            if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.voltage) {
              // Check Connector ID
              const connector = Utils.getConnectorFromID(chargingStation, connectorId);
              if (connector.voltage) {
                return connector.voltage;
              }
              return chargePointOfCS.voltage;
            }
          }
        }
      }
      // Check at connector level
      if (chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          // Take the first
          if (connectorId === 0 && connector.voltage) {
            return connector.voltage;
          }
          if (connector.connectorId === connectorId && connector.voltage) {
            return connector.voltage;
          }
        }
      }
    }
    return 0;
  }

  public static getChargingStationCurrentType(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorId = 0): CurrentType {
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.currentType) {
              return chargePointOfCS.currentType;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.currentType) {
              // Check Connector ID
              const connector = Utils.getConnectorFromID(chargingStation, connectorId);
              if (connector.currentType) {
                return connector.currentType;
              }
              return chargePointOfCS.currentType;
            }
          }
        }
      }
      // Check at connector level
      if (chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          // Take the first
          if (connectorId === 0 && connector.currentType) {
            return connector.currentType;
          }
          if (connector.connectorId === connectorId && connector.currentType) {
            return connector.currentType;
          }
        }
      }
    }
    return null;
  }

  // tslint:disable-next-line: cyclomatic-complexity
  public static getChargingStationAmperage(chargingStation: ChargingStation, chargePoint?: ChargePoint, connectorId = 0): number {
    let totalAmps = 0;
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.amperage) {
              totalAmps += chargePointOfCS.amperage;
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.amperage) {
              if (chargePointOfCS.cannotChargeInParallel || chargePointOfCS.sharePowerToAllConnectors) {
                // Same power for all connectors
                // Check Connector ID first
                const connector = Utils.getConnectorFromID(chargingStation, connectorId);
                if (connector.amperage) {
                  return connector.amperage;
                }
                return chargePointOfCS.amperage;
              }
              // Power is split evenly per connector
              return chargePointOfCS.amperage / chargePointOfCS.connectorIDs.length;
            }
          }
        }
      }
      // Check at connector level
      if (totalAmps === 0 && chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          if (connectorId === 0 && connector.amperage) {
            totalAmps += connector.amperage;
          }
          if (connector.connectorId === connectorId && connector.amperage) {
            return connector.amperage;
          }
        }
      }
    }
    return totalAmps;
  }

  public static getChargingStationAmperageLimit(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorId = 0): number {
    let amperageLimit = 0;
    if (chargingStation) {
      if (connectorId > 0) {
        return Utils.getConnectorFromID(chargingStation, connectorId).amperageLimit;
      }
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            if (chargePointOfCS.excludeFromPowerLimitation) {
              continue;
            }
            if (chargePointOfCS.cannotChargeInParallel ||
                chargePointOfCS.sharePowerToAllConnectors) {
              // Add limit amp of one connector
              amperageLimit += Utils.getConnectorFromID(chargingStation, chargePointOfCS.connectorIDs[0]).amperageLimit;
            } else {
              // Add limit amp of all connectors
              for (const connectorID of chargePointOfCS.connectorIDs) {
                amperageLimit += Utils.getConnectorFromID(chargingStation, connectorID).amperageLimit;
              }
            }
          }
        }
      }
      // Check at connector level
      if (amperageLimit === 0 && chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          amperageLimit += connector.amperageLimit;
        }
      }
    }
    return amperageLimit;
  }

  public static convertAmpToWattString(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorId = 0,
      appUnitFormatter: AppUnitPipe, ampValue: number, unit: 'W'|'kW' = 'kW', displayUnit: boolean = true,
      numberOfDecimals?: number): string {
    // TBD use corresponding connector, instead of first connector
    if (chargingStation) {
      return appUnitFormatter.transform(
        Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, ampValue),
          'W', unit, displayUnit, 1, 0, numberOfDecimals ? numberOfDecimals : 0);
    }
    return 'N/A';
  }

  public static buildCarUsersFullName(carUsers: UserCar[]) {
    let usersName: string;
    if (Utils.isEmptyArray(carUsers)) {
      return '-';
    }
    // Find the owner
    const userCarOwner = carUsers.find((userCar) => userCar.owner);
    if (userCarOwner) {
      // Build user name
      usersName = Utils.buildUserFullName(userCarOwner.user);
    }
    // Build with first user name
    if (!usersName) {
      usersName = Utils.buildUserFullName(carUsers[0].user);
    }
    // Add number of remaining users
    if (carUsers.length > 1) {
      usersName += ` (+${carUsers.length - 1})`;
    }
    return usersName;
  }

  public static buildUsersFullName(users: User[]) {
    if (Utils.isEmptyArray(users)) {
      return '-';
    }
    // Build first user name
    let usersName = Utils.buildUserFullName(users[0]);
    // Add number of remaing users
    if (users.length > 1) {
      usersName += ` (+${users.length - 1})`;
    }
    return usersName;
  }

  public static buildUserFullName(user: User|UserToken, withID = false): string {
    let fullName: string;
    if (!user || !user.name) {
      return '-';
    }
    // eslint-disable-next-line no-lonely-if
    if (user.firstName) {
      fullName = `${user.firstName} ${user.name}`;
    } else {
      fullName = user.name;
    }
    if (withID && user.id) {
      fullName += ` (${user.id})`;
    }
    return fullName;
  }

  public static buildCarCatalogName(carCatalog: CarCatalog, withID = false): string {
    let carCatalogName: string;
    if (!carCatalog) {
      return '-';
    }
    carCatalogName = carCatalog.vehicleMake;
    if (carCatalog.vehicleModel) {
      carCatalogName += ` ${carCatalog.vehicleModel}`;
    }
    if (carCatalog.vehicleModelVersion) {
      carCatalogName += ` ${carCatalog.vehicleModelVersion}`;
    }
    if (withID && carCatalog.id) {
      carCatalogName += ` (${carCatalog.id})`;
    }
    return carCatalogName;
  }

  public static buildCarName(car: Car, withID = false): string {
    let carName: string;
    if (!car) {
      return '-';
    }
    if (car.carCatalog) {
      carName = Utils.buildCarCatalogName(car.carCatalog, withID);
    }
    if (!carName) {
      carName = `VIN '${car.vin}', License Plate '${car.licensePlate}'`;
    } else {
      carName += ` with VIN '${car.vin}' and License Plate '${car.licensePlate}'`;
    }
    if (withID && car.id) {
      carName += ` (${car.id})`;
    }
    return carName;
  }

  public static getCarType(carType: CarType, translateService: TranslateService): string {
    switch (carType) {
      case CarType.COMPANY:
        return translateService.instant('cars.company_car');
      case CarType.PRIVATE:
        return translateService.instant('cars.private_car');
      case CarType.POOL_CAR:
        return translateService.instant('cars.pool_car');
    }
  }

  public static buildConverterName(chargeStandardTable: CarConverter, translateService: TranslateService): string {
    let converterName: string;
    if (!chargeStandardTable) {
      return '-';
    }
    converterName = chargeStandardTable.type;
    if (chargeStandardTable.evsePhaseAmp) {
      converterName += ` - ${chargeStandardTable.evsePhaseAmp} A`;
    }
    if (chargeStandardTable.evsePhase) {
      converterName += ` - ${chargeStandardTable.evsePhase} ${translateService.instant('cars.evse_phase')}`;
    }
    if (chargeStandardTable.chargePower) {
      converterName += ` - ${chargeStandardTable.chargePower} kW`;
    }
    return converterName;
  }

  public static getMobileVendor(): MobileType|null {
    const userAgent: string = navigator.userAgent as string || navigator.vendor as string || window['opera'] as string;
    if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
      return MobileType.IOS;
    } else if (userAgent.match(/Android/i)) {
      return MobileType.ANDROID;
    }
    return null;
  }

  public static buildMobileAppDeepLink(path: string): string {
    const mobileVendor = Utils.getMobileVendor();
    switch (mobileVendor) {
      case MobileType.IOS:
        return `eMobility://${path}`;
      case MobileType.ANDROID:
        return `intent://${path}#Intent;scheme=eMobility;package=com.emobility;end`;
    }
  }

  public static handleHttpError(error: any, router: Router, messageService: MessageService,
    centralServerService: CentralServerService, errorMessage: string, params?: object) {
    // Check error
    switch (error.status) {
      // Server connection error
      case 0:
        messageService.showErrorMessageConnectionLost();
        break;

      // Unauthorized!
      case UNAUTHORIZED:
        // Log Off (remove token)
        centralServerService.logoutSucceeded();
        // Not logged in so redirect to login page with the return url
        router.navigate(['/auth/login']);
        break;

      // Conflict in User Session
      case FORBIDDEN:
        messageService.showWarningMessageUserOrTenantUpdated();
        // Log Off (remove token)
        centralServerService.logoutSucceeded();
        // Navigate to Login
        router.navigate(['/auth/login']);
        break;

      case BAD_REQUEST:
        messageService.showErrorMessage('general.invalid_content');
        break;

      case CONFLICT:
        if (error.details) {
          messageService.showErrorMessage(error.details.message, error.details.params);
        } else {
          messageService.showErrorMessage(error.message);
        }
        break;

      // Backend issue
      default:
        console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`);
        messageService.showErrorMessage(errorMessage, params);
        break;
    }
  }

  public static convertToDate(date: any): Date {
    // Check
    if (!date) {
      return date;
    }
    // Check Type
    if (!(date instanceof Date)) {
      return new Date(date);
    }
    return date;
  }

  public static convertToInteger(value: any): number {
    let changedValue = value;
    if (!value) {
      return 0;
    }
    // Check
    if (typeof value === 'string') {
      // Create Object
      changedValue = parseInt(value, 10);
    }
    return changedValue;
  }

  public static convertToFloat(value: any): number {
    let changedValue = value;
    if (!value) {
      return 0;
    }
    // Check
    if (typeof value === 'string') {
      // Create Object
      changedValue = parseFloat(value);
    }
    return changedValue;
  }

  public static isNull(obj: any): boolean {
    // tslint:disable-next-line: triple-equals
    return obj == null;
  }

  public static isValidDate(date: any): boolean {
    return moment(date).isValid();
  }

  public static copyToClipboard(content: any) {
    const element = document.createElement('textarea');
    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.opacity = '0';
    element.value = content;
    document.body.appendChild(element);
    element.focus();
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
  }
}
