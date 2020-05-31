import * as moment from 'moment';

import { BAD_REQUEST, CONFLICT, FORBIDDEN, UNAUTHORIZED } from 'http-status-codes';
import { ChargePoint, ChargingStation, ChargingStationPowers, Connector, CurrentType, StaticLimitAmps } from 'app/types/ChargingStation';
import { Data, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

import { Address } from 'app/types/Address';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { ButtonType } from 'app/types/Table';
import { CarCatalog } from 'app/types/Car';
import { CentralServerService } from '../services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { KeyValue } from 'app/types/GlobalType';
import { MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../services/message.service';
import { MobileType } from 'app/types/Mobile';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'app/types/User';

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
    const result: ChargingStationPowers = {
      notSupported: false,
      minAmp: StaticLimitAmps.MIN_LIMIT,
      minWatt: Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, StaticLimitAmps.MIN_LIMIT),
      maxAmp: StaticLimitAmps.MIN_LIMIT,
      maxWatt: Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, StaticLimitAmps.MIN_LIMIT),
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

  public static computeAmpSteps(chargingStation: ChargingStation): number {
    if (chargingStation) {
      // Voltage at connector level?
      if (chargingStation.connectors) {
        for (const connector of chargingStation.connectors) {
          if (connector.numberOfConnectedPhase) {
            return connector.numberOfConnectedPhase * chargingStation.connectors.length;
          }
        }
      }
    }
    return StaticLimitAmps.MIN_LIMIT;
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
    return chargingStation.chargePoints.find((chargePoint) => chargePoint.chargePointID === chargePointID);
  }

  public static getConnectorFromID(chargingStation: ChargingStation, connectorID: number): Connector {
    if (!chargingStation.connectors) {
      return null;
    }
    return chargingStation.connectors.find((connector) => connector.connectorId === connectorID);
  }

  public static computeChargingStationTotalAmps(chargingStation: ChargingStation): number {
    let totalAmps = 0;
    if (chargingStation) {
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
    if (totalAmps === 0 && chargingStation.maximumPower) {
      totalAmps = Utils.convertWattToAmp(chargingStation, null, 0, chargingStation.maximumPower);
    }
    return totalAmps;
  }

  public static getChargingStationPower(chargingStation: ChargingStation, chargePoint: ChargePoint, connectorId = 0): number {
    const amperage = Utils.getChargingStationAmperage(chargingStation, chargePoint, connectorId);
    const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorId);
    return voltage * amperage;
  }

  public static getNumberOfConnectedPhases(chargingStation: ChargingStation, chargePoint?: ChargePoint, connectorId = 0): number {
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        if (chargePoint) {
          if (connectorId === 0 && chargePoint.numberOfConnectedPhase) {
            return chargePoint.numberOfConnectedPhase;
          }
          if (chargePoint.connectorIDs.includes(connectorId) && chargePoint.numberOfConnectedPhase) {
            return chargePoint.numberOfConnectedPhase;
          }
        } else {
          for (const chargePointOfCS of chargingStation.chargePoints) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.numberOfConnectedPhase) {
              return chargePointOfCS.numberOfConnectedPhase;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.numberOfConnectedPhase) {
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
        if (chargePoint) {
          if (chargePoint.connectorIDs.includes(connectorId) && chargePoint.voltage) {
            return chargePoint.voltage;
          }
        } else {
          for (const chargePointOfCS of chargingStation.chargePoints) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.voltage) {
              return chargePointOfCS.voltage;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.voltage) {
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
        if (chargePoint) {
          if (chargePoint.connectorIDs.includes(connectorId) && chargePoint.currentType) {
            return chargePoint.currentType;
          }
        } else {
          for (const chargePointOfCS of chargingStation.chargePoints) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.currentType) {
              return chargePointOfCS.currentType;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.currentType) {
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
        if (chargePoint) {
          // Charging Station
          if (connectorId === 0 && chargePoint.amperage) {
            totalAmps += chargePoint.amperage;
          // Connector
          } else if (chargePoint.connectorIDs.includes(connectorId) && chargePoint.amperage &&
              (chargePoint.cannotChargeInParallel || chargePoint.sharePowerToAllConnectors)) {
            return chargePoint.amperage;
          }
        } else {
          for (const chargePointOfCS of chargingStation.chargePoints) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.amperage) {
              totalAmps += chargePointOfCS.amperage;
            // Connector
            } else if (chargePointOfCS.connectorIDs.includes(connectorId) && chargePointOfCS.amperage &&
                (chargePointOfCS.cannotChargeInParallel || chargePointOfCS.sharePowerToAllConnectors)) {
              return chargePointOfCS.amperage;
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
        if (chargePoint) {
          if (chargePoint.excludeFromPowerLimitation) {
            return 0;
          }
          // Add limit amp of one connector of the charge point
          if (chargePoint.cannotChargeInParallel || chargePoint.sharePowerToAllConnectors) {
            return Utils.getConnectorFromID(chargingStation, chargePoint.connectorIDs[0]).amperageLimit;
          }
          // Add limit amp of all connectors of the charge point
          for (const connectorID of chargePoint.connectorIDs) {
            amperageLimit += Utils.getConnectorFromID(chargingStation, connectorID).amperageLimit;
          }
        } else {
          for (const chargePointOfCS of chargingStation.chargePoints) {
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
      // Check at connector level
      } else if (chargingStation.connectors) {
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
          'W', unit, displayUnit, 1, numberOfDecimals ? numberOfDecimals : 0);
    }
    return 'N/A';
  }

  public static buildUserFullName(user: User) {
    let fullName: string;
    if (!user || !user.name) {
      return '######';
    }
    if (user.name.length === 0 && user.firstName.length === 0) {
      return '######';
    }
    if (user.firstName) {
      fullName = `${user.name}, ${user.firstName}`;
    } else {
      fullName = user.name;
    }
    return fullName;
  }

  public static buildCarName(carCatalog: CarCatalog) {
    let carName: string;
    if (!carCatalog) {
      return '######';
    }
    carName = carCatalog.vehicleMake;
    if (carCatalog.vehicleModel) {
      carName += ` ${carCatalog.vehicleModel}`;
    }
    if (carCatalog.vehicleModelVersion) {
      carName += ` ${carCatalog.vehicleModelVersion}`;
    }
    return carName;
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
      // Server connection error`
      case 0:
        messageService.showErrorMessageConnectionLost();
        if (centralServerService.isAuthenticated()) {
          // Log Off (remove token)
          centralServerService.logoutSucceeded();
        }
        // Login
        router.navigate(['/auth/login']);
        break;

      // Unauthorized!
      case UNAUTHORIZED:
        // Not logged in so redirect to login page with the return url
        router.navigate(['/auth/login']);
        break;
      // Conflict in User Session
      case FORBIDDEN:
        messageService.showWarningMessageUserOrTenantUpdated();
        if (centralServerService.isAuthenticated()) {
          // Log Off (remove token)
          centralServerService.logoutSucceeded();
        }
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
