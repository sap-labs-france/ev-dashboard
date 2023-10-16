import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Data, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import * as moment from 'moment';
import { DialogMode } from 'types/Authorization';
import { HTTPError } from 'types/HTTPError';
import { Tag } from 'types/Tag';
import { User, UserToken } from 'types/User';

import { Ordering } from 'types/DataResult';
import { ReservationType } from 'types/Reservation';
import { CentralServerService } from '../services/central-server.service';
import { DialogService } from '../services/dialog.service';
import { MessageService } from '../services/message.service';
import { AppUnitPipe } from '../shared/formatters/app-unit.pipe';
import { Address } from '../types/Address';
import { Car, CarCatalog, CarConverter, CarType } from '../types/Car';
import {
  ChargePoint,
  ChargingStation,
  ChargingStationPowers,
  Connector,
  ConnectorType,
  CurrentType,
  StaticLimitAmps,
  Voltage,
} from '../types/ChargingStation';
import { ButtonAction, KeyValue } from '../types/GlobalType';
import { MobileType } from '../types/Mobile';
import { FilterType, TableDataSourceMode, TableFilterDef } from '../types/Table';
import { Constants } from './Constants';

export class Utils {
  public static generateTagID(size = 8): string {
    return [...Array(size)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('')
      .toUpperCase();
  }

  public static shrinkObjectProperties(properties: any): any {
    for (const propertyName in properties) {
      if (!properties[propertyName]) {
        delete properties[propertyName];
      }
    }
    if (Utils.isEmptyObject(properties)) {
      return null;
    }
    return properties;
  }

  public static buildDependentFilters(filterDef: TableFilterDef) {
    if (!Utils.isEmptyArray(filterDef.dependentFilters)) {
      filterDef.dialogComponentData = {
        staticFilter: {},
      };
      for (const dependentFilter of filterDef.dependentFilters) {
        if (!Utils.isEmptyArray(dependentFilter.currentValue)) {
          if (dependentFilter.multiple) {
            if (
              dependentFilter.type === FilterType.DROPDOWN &&
              dependentFilter.currentValue.length === dependentFilter.items.length &&
              dependentFilter.exhaustive
            ) {
              continue;
            }
            filterDef.dialogComponentData.staticFilter[dependentFilter.httpId] =
              dependentFilter.currentValue.map((obj) => obj.key).join('|');
          } else {
            filterDef.dialogComponentData.staticFilter[dependentFilter.httpId] =
              dependentFilter.currentValue[0].key;
          }
        } else {
          delete filterDef.dialogComponentData.staticFilter[dependentFilter.httpId];
        }
      }
    }
  }

  public static displayYesNo(translateService: TranslateService, value: boolean) {
    return value ? translateService.instant('general.yes') : translateService.instant('general.no');
  }

  public static handleDialogMode(dialogMode: DialogMode, formGroup: UntypedFormGroup) {
    switch (dialogMode) {
      case DialogMode.CREATE:
      case DialogMode.EDIT:
        break;
      case DialogMode.VIEW:
        formGroup.disable();
        break;
    }
  }

  public static buildConnectorInfo(connector: Connector): string {
    const info = [];
    if (!Utils.isEmptyString(connector.errorCode) && connector.errorCode !== 'NoError') {
      info.push(connector.errorCode);
    }
    if (!Utils.isEmptyString(connector.vendorErrorCode)) {
      info.push(connector.vendorErrorCode);
    }
    if (!Utils.isEmptyString(connector.info)) {
      info.push(connector.info);
    }
    if (Utils.isEmptyArray(info)) {
      info.push('-');
    }
    return info.join(' - ');
  }

  public static getTableDataSourceModeFromDialogMode(dialogMode: DialogMode): TableDataSourceMode {
    switch (dialogMode) {
      case DialogMode.CREATE:
      case DialogMode.EDIT:
        return TableDataSourceMode.READ_WRITE;
      case DialogMode.VIEW:
        return TableDataSourceMode.READ_ONLY;
      default:
        return TableDataSourceMode.READ_ONLY;
    }
  }

  public static isEmptyObject(object: any): boolean {
    if (!object) {
      return true;
    }
    return Object.keys(object).length === 0;
  }

  public static isEmptyArray(array: any): boolean {
    if (!array) {
      return true;
    }
    if (Array.isArray(array) && array.length > 0) {
      return false;
    }
    return true;
  }

  public static isEmptyString(str: string): boolean {
    return str ? str.length === 0 : true;
  }

  public static convertEmptyStringToNull(control: AbstractControl) {
    if (this.isEmptyString(control.value)) {
      control.setValue(null);
    }
  }

  public static getConnectorLetterFromConnectorID(connectorID: number): string {
    return String.fromCharCode(65 + connectorID - 1);
  }

  public static getValuesFromEnum(enumType: any): number[] {
    const keys: string[] = Object.keys(enumType).filter(
      (httpError) => typeof enumType[httpError] === 'number'
    );
    const values: number[] = keys.map((httpErrorKey: string) => enumType[httpErrorKey]);
    return values;
  }

  public static registerCloseKeyEvents(dialogRef: MatDialogRef<any>) {
    // listen to keystroke
    dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents && keydownEvents.code === 'Escape') {
        dialogRef.close();
      }
    });
  }

  public static registerValidateCloseKeyEvents(
    dialogRef: MatDialogRef<any>,
    validate: () => void,
    close: () => void
  ) {
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

  public static registerSaveCloseKeyEvents(
    dialogRef: MatDialogRef<any>,
    formGroup: UntypedFormGroup,
    save: (data: Data) => void,
    close: () => void
  ) {
    // listen to keystroke
    dialogRef.keydownEvents().subscribe((keydownEvents) => {
      if (keydownEvents?.code === 'Escape') {
        close();
      }
      if (keydownEvents?.key === 'Enter') {
        if (formGroup.valid && formGroup.dirty) {
          save(formGroup.getRawValue());
        }
      }
    });
  }

  public static checkAndSaveAndCloseDialog(
    formGroup: UntypedFormGroup,
    dialogService: DialogService,
    translateService: TranslateService,
    save: (data: Data) => void,
    closeDialog: (saved: boolean) => void
  ) {
    if (formGroup.invalid && formGroup.dirty) {
      dialogService
        .createAndShowInvalidChangeCloseDialog(
          translateService.instant('general.change_invalid_pending_title'),
          translateService.instant('general.change_invalid_pending_text')
        )
        .subscribe((result) => {
          if (result === ButtonAction.DO_NOT_SAVE_AND_CLOSE) {
            closeDialog(false);
          }
        });
    } else if (formGroup.dirty) {
      dialogService
        .createAndShowDirtyChangeCloseDialog(
          translateService.instant('general.change_pending_title'),
          translateService.instant('general.change_pending_text')
        )
        .subscribe((result) => {
          if (result === ButtonAction.SAVE_AND_CLOSE) {
            save(formGroup.getRawValue());
          } else if (result === ButtonAction.DO_NOT_SAVE_AND_CLOSE) {
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
      // Check Longitude & Latitude
      if (
        new RegExp(Constants.REGEX_VALIDATION_LONGITUDE).test(coordinates[0].toString()) &&
        new RegExp(Constants.REGEX_VALIDATION_LATITUDE).test(coordinates[1].toString())
      ) {
        return true;
      }
    }
    return false;
  }

  public static cloneObject<T>(object: T): T {
    return JSON.parse(JSON.stringify(object)) as T;
  }

  public static validateEqual(
    formGroup: UntypedFormGroup,
    firstField: string,
    secondField: string
  ) {
    const field1: UntypedFormControl = formGroup.controls[firstField] as UntypedFormControl;
    const field2: UntypedFormControl = formGroup.controls[secondField] as UntypedFormControl;

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

  public static objectHasProperty(object: any, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(object, key) as boolean;
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

  public static handleError(
    error: any,
    messageService: MessageService,
    errorMessage: string = '',
    params?: Record<string, unknown>
  ): void {
    console.log(`Error: ${errorMessage}`, error);
    messageService.showErrorMessage(errorMessage, params);
  }

  public static isInMobileApp(subDomain: string): boolean {
    return Utils.getMobileVendor() !== null && subDomain !== 'ezcharge';
  }

  public static replaceSpecialCharsInCSVValueParam(value: string): string {
    return value ? value.replace(/\n/g, '') : '';
  }

  public static getChargingStationPowers(
    chargingStation: ChargingStation,
    chargePoint?: ChargePoint,
    connectorId = 0,
    forChargingProfile: boolean = false
  ): ChargingStationPowers {
    const numberOfPhases = Utils.getNumberOfConnectedPhases(
      chargingStation,
      chargePoint,
      connectorId
    );
    const numberOfConnectors = chargePoint
      ? chargePoint.connectorIDs.length
      : chargingStation.connectors.length;
    const result: ChargingStationPowers = {
      notSupported: false,
      minAmp: StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors,
      minWatt: Utils.convertAmpToWatt(
        chargingStation,
        chargePoint,
        connectorId,
        StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors
      ),
      maxAmp: StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors,
      maxWatt: Utils.convertAmpToWatt(
        chargingStation,
        chargePoint,
        connectorId,
        StaticLimitAmps.MIN_LIMIT_PER_PHASE * numberOfPhases * numberOfConnectors
      ),
      currentAmp: 0,
      currentWatt: 0,
    };
    if (
      !chargingStation ||
      !chargingStation.connectors ||
      Utils.isEmptyArray(chargingStation.connectors)
    ) {
      result.notSupported = true;
      result.currentAmp = result.maxAmp;
      result.currentWatt = Utils.convertAmpToWatt(
        chargingStation,
        chargePoint,
        connectorId,
        result.currentAmp
      );
      return result;
    }
    const chargingStationAmperageLimit = Utils.getChargingStationAmperageLimit(
      chargingStation,
      chargePoint,
      connectorId
    );
    // Use Limit Amps
    if (forChargingProfile) {
      result.maxAmp = chargingStationAmperageLimit;
    } else {
      result.currentAmp = chargingStationAmperageLimit;
      result.maxAmp = Utils.getChargingStationAmperage(chargingStation, chargePoint, connectorId);
    }
    // Default
    if (result.currentAmp === 0) {
      result.currentAmp = result.maxAmp;
    }
    result.minWatt = Utils.convertAmpToWatt(
      chargingStation,
      chargePoint,
      connectorId,
      result.minAmp
    );
    result.maxWatt = Utils.convertAmpToWatt(
      chargingStation,
      chargePoint,
      connectorId,
      result.maxAmp
    );
    result.currentWatt = Utils.convertAmpToWatt(
      chargingStation,
      chargePoint,
      connectorId,
      result.currentAmp
    );
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

  public static computeStaticLimitAmpSteps(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint
  ): number {
    if (chargingStation && chargePoint) {
      const numberOfPhases = Utils.getNumberOfConnectedPhases(chargingStation, chargePoint, 0);
      if (numberOfPhases > 0) {
        return numberOfPhases * chargePoint.connectorIDs.length;
      }
    }
    return 6;
  }

  public static roundTo(value: number, scale: number): number {
    const roundPower = Math.pow(10, scale);
    return Math.round(value * roundPower) / roundPower;
  }

  public static convertAmpToWatt(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint,
    connectorID = 0,
    ampValue: number
  ): number {
    const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorID);
    if (voltage) {
      return voltage * ampValue;
    }
    return 0;
  }

  public static convertWattToAmp(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint,
    connectorID = 0,
    wattValue: number
  ): number {
    const voltage = Utils.getChargingStationVoltage(chargingStation, chargePoint, connectorID);
    if (voltage) {
      return Math.floor(wattValue / voltage);
    }
    return 0;
  }

  public static getChargePointFromID(
    chargingStation: ChargingStation,
    chargePointID: number
  ): ChargePoint {
    if (!chargingStation.chargePoints) {
      return null;
    }
    return chargingStation.chargePoints.find(
      (chargePoint: ChargePoint) => chargePoint && chargePoint.chargePointID === chargePointID
    );
  }

  public static getConnectorFromID(
    chargingStation: ChargingStation,
    connectorID: number
  ): Connector {
    if (!chargingStation.connectors) {
      return null;
    }
    return chargingStation.connectors.find(
      (connector: Connector) => connector && connector.connectorId === connectorID
    );
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

  // eslint-disable-next-line complexity
  public static getChargingStationPower(
    chargingStation: ChargingStation,
    chargePoint?: ChargePoint,
    connectorId = 0
  ): number {
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
            } else if (
              chargePointOfCS.connectorIDs.includes(connectorId) &&
              chargePointOfCS.power
            ) {
              if (
                chargePointOfCS.cannotChargeInParallel ||
                chargePointOfCS.sharePowerToAllConnectors
              ) {
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

  public static getNumberOfConnectedPhases(
    chargingStation: ChargingStation,
    chargePoint?: ChargePoint,
    connectorId = 0
  ): number {
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
            if (
              chargePointOfCS.connectorIDs.includes(connectorId) &&
              chargePointOfCS.numberOfConnectedPhase
            ) {
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

  public static adjustChargePoints(chargingStation: ChargingStation) {
    for (const chargePoint of chargingStation.chargePoints) {
      chargePoint.amperage = 0;
      chargePoint.power = 0;
      for (const connectorID of chargePoint.connectorIDs) {
        const connector = Utils.getConnectorFromID(chargingStation, connectorID);
        if (connector) {
          if (chargePoint.cannotChargeInParallel || chargePoint.sharePowerToAllConnectors) {
            chargePoint.amperage = connector.amperage;
            chargePoint.power = connector.power;
          } else {
            chargePoint.amperage += connector.amperage;
            chargePoint.power += connector.power;
          }
          chargePoint.numberOfConnectedPhase = connector.numberOfConnectedPhase;
          chargePoint.currentType = connector.currentType;
          chargePoint.voltage = connector.voltage;
        }
      }
    }
  }

  public static getChargingStationVoltage(
    chargingStation: ChargingStation,
    chargePoint?: ChargePoint,
    connectorId = 0
  ): Voltage {
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
    return Voltage.VOLTAGE_230;
  }

  public static getChargingStationCurrentType(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint,
    connectorId = 0
  ): CurrentType {
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.currentType) {
              return chargePointOfCS.currentType;
              // Connector
            } else if (
              chargePointOfCS.connectorIDs.includes(connectorId) &&
              chargePointOfCS.currentType
            ) {
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

  // eslint-disable-next-line complexity
  public static getChargingStationAmperage(
    chargingStation: ChargingStation,
    chargePoint?: ChargePoint,
    connectorId = 0
  ): number {
    let totalAmps = 0;
    if (chargingStation) {
      // Check at charge point level
      if (chargingStation.chargePoints) {
        for (const chargePointOfCS of chargingStation.chargePoints) {
          if (!chargePoint || chargePoint.chargePointID === chargePointOfCS.chargePointID) {
            // Charging Station
            if (connectorId === 0 && chargePointOfCS.amperage) {
              totalAmps += chargePointOfCS.amperage;
            } else if (
              chargePointOfCS.connectorIDs.includes(connectorId) &&
              chargePointOfCS.amperage
            ) {
              if (
                chargePointOfCS.cannotChargeInParallel ||
                chargePointOfCS.sharePowerToAllConnectors
              ) {
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

  public static getChargingStationAmperageLimit(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint,
    connectorId = 0
  ): number {
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
            if (
              chargePointOfCS.cannotChargeInParallel ||
              chargePointOfCS.sharePowerToAllConnectors
            ) {
              // Add limit amp of one connector
              amperageLimit += Utils.getConnectorFromID(
                chargingStation,
                chargePointOfCS.connectorIDs[0]
              ).amperageLimit;
            } else {
              // Add limit amp of all connectors
              for (const connectorID of chargePointOfCS.connectorIDs) {
                amperageLimit += Utils.getConnectorFromID(
                  chargingStation,
                  connectorID
                ).amperageLimit;
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
    const amperageMax = Utils.getChargingStationAmperage(chargingStation, chargePoint, connectorId);
    // Check and default
    if (amperageLimit === 0 || amperageLimit > amperageMax) {
      amperageLimit = amperageMax;
    }
    return amperageLimit;
  }

  public static convertAmpToWattString(
    chargingStation: ChargingStation,
    chargePoint: ChargePoint,
    connectorId = 0,
    appUnitFormatter: AppUnitPipe,
    ampValue: number,
    unit: 'W' | 'kW' = 'kW',
    displayUnit: boolean = true,
    numberOfDecimals?: number
  ): string {
    // TBD use corresponding connector, instead of first connector
    if (chargingStation) {
      return appUnitFormatter.transform(
        Utils.convertAmpToWatt(chargingStation, chargePoint, connectorId, ampValue),
        'W',
        unit,
        displayUnit,
        1,
        0,
        numberOfDecimals ? numberOfDecimals : 0
      );
    }
    return 'N/A';
  }

  public static buildUsersFullName(users: User[]) {
    if (Utils.isEmptyArray(users)) {
      return '-';
    }
    // Build first user name
    let usersName = Utils.buildUserFullName(users[0]);
    // Add number of remaining users
    if (users.length > 1) {
      usersName += ` (+${users.length - 1})`;
    }
    return usersName;
  }

  public static buildUserFullName(user: User | UserToken, withID = false): string {
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

  public static buildTagName(tag: Tag): string {
    let tagName: string;
    if (!tag) {
      return '-';
    }
    if (tag.description) {
      tagName = `${tag.description} (${tag.visualID})`;
    } else {
      tagName = tag.visualID;
    }
    return tagName;
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

  public static buildCarName(
    car: Car,
    translateService: TranslateService,
    withVIN = true,
    withID = false
  ): string {
    const carName: string[] = [];
    if (!car) {
      return '-';
    }
    // Car name
    if (car.carCatalog) {
      carName.push(Utils.buildCarCatalogName(car.carCatalog, withID));
    }
    // VIN
    if (withVIN && car.vin) {
      carName.push(`${translateService.instant('cars.vin')} '${car.vin}'`);
    }
    // License plate
    carName.push(`(${car.licensePlate})`);
    // Car ID
    if (withID && car.id) {
      carName.push(`(${car.id})`);
    }
    return carName.join(' ');
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

  public static buildCarCatalogConverterName(
    converter: CarConverter,
    translateService: TranslateService
  ): string {
    let converterName = '';
    converterName += `${converter.powerWatts} kW`;
    if (converter.numberOfPhases > 0) {
      converterName += ` - ${converter.numberOfPhases} ${translateService.instant(
        'cars.evse_phase'
      )}`;
    }
    if (converter.amperagePerPhase > 0) {
      converterName += ` - ${converter.amperagePerPhase} A`;
    }
    return converterName;
  }

  public static getMobileVendor(): MobileType | null {
    const userAgent: string =
      (navigator.userAgent as string) ||
      (navigator.vendor as string) ||
      (window['opera'] as string);
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

  public static handleHttpError(
    error: any,
    router: Router,
    messageService: MessageService,
    centralServerService: CentralServerService,
    errorMessage: string,
    params?: Record<string, unknown>
  ): void {
    // Check error
    switch (error.status) {
      // Server connection error
      case 0:
        messageService.showErrorMessageConnectionLost();
        break;
      case HTTPError.USER_ACCOUNT_CHANGED:
      case HTTPError.TENANT_COMPONENT_CHANGED:
        messageService.showWarningMessageUserOrTenantUpdated();
        // Log Off (remove token)
        centralServerService.clearLoginInformation();
        // Navigate to Login
        void router.navigate(['/auth/login']);
        break;
      // Unauthorized: Token expired
      case StatusCodes.UNAUTHORIZED:
        // Log Off (remove token)
        centralServerService.clearLoginInformation();
        // Navigate to Login
        void router.navigate(['/auth/login']);
        break;
      // Forbidden
      case StatusCodes.FORBIDDEN:
        messageService.showErrorMessage('general.not_authorized');
        break;
      case StatusCodes.BAD_REQUEST:
        messageService.showErrorMessage('general.invalid_content');
        break;
      case StatusCodes.CONFLICT:
        if (error.details) {
          messageService.showErrorMessage(error.details.message, error.details.params);
        } else {
          messageService.showErrorMessage(error.message);
        }
        break;
      case StatusCodes.REQUEST_TIMEOUT:
        messageService.showErrorMessage(error.message);
        break;
      case StatusCodes.MOVED_TEMPORARILY:
        const { redirectDomain = null, subdomain = null } =
          error.details?.errorDetailedMessage || {};
        if (redirectDomain && subdomain) {
          centralServerService.getWindowService().redirectToDomain(redirectDomain, subdomain);
        } else {
          console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`, error);
        }
        break;
      // Backend issue
      default:
        console.log(`HTTP Error: ${errorMessage}: ${error.message} (${error.status})`, error);
        messageService.showErrorMessage(errorMessage, params);
        break;
    }
  }

  public static convertToBoolean(value: any): boolean {
    let result = false;
    // Check boolean
    if (value) {
      // Check the type
      if (typeof value === 'boolean') {
        // Already a boolean
        result = value;
      } else {
        // Convert
        result = value === 'true';
      }
    }
    return result;
  }

  public static convertToDate(value: any): Date {
    if (!value) {
      return value;
    }
    // Check Type
    if (!(value instanceof Date)) {
      return new Date(value);
    }
    return value;
  }

  public static convertToInteger(value: any): number {
    let changedValue = value;
    if (!value) {
      return 0;
    }
    if (typeof value === 'string') {
      // Create Object
      changedValue = parseInt(value, 10);
    }
    return changedValue;
  }

  public static convertToFloat(value: any): number {
    let changedValue: number = value;
    if (!value) {
      return 0;
    }
    if (typeof value === 'string') {
      // Create Object
      changedValue = parseFloat(value);
    }
    return changedValue;
  }

  public static isNullOrUndefined(obj: any): boolean {
    // eslint-disable-next-line eqeqeq
    return obj == null;
  }

  public static isValidDate(date: any): boolean {
    return moment(date).isValid();
  }

  public static isUndefined(obj: any): boolean {
    return typeof obj === 'undefined';
  }

  public static copyToClipboard(content: any) {
    void navigator.clipboard.writeText(content);
  }

  // when exporting values
  public static escapeCsvValue(value: any): string {
    // add double quote start and end
    // replace double quotes inside value to double double quotes to display double quote correctly in csv editor
    return typeof value === 'string' ? '"' + value.replace(/"/g, '""') + '"' : value;
  }

  public static normalizeLocaleString(locale: string): string {
    if (Constants.SUPPORTED_LOCALES.includes(locale)) {
      return locale;
    }
    return Constants.DEFAULT_LOCALE; // en_US
  }

  public static extractLanguage(locale: string): string {
    return locale.substring(0, locale.indexOf('_'));
  }

  public static convertToLocale(browserLocale: string): string {
    return browserLocale.replace('-', '_');
  }

  public static convertToBrowserLocale(locale: string): string {
    return locale.replace('_', '-');
  }

  public static convertToMomentLocale(locale: string): string {
    let momentLocale = Utils.convertToBrowserLocale(locale).toLowerCase(); // Converts 'fr-FR' to 'fr-fr'
    const fragments = momentLocale.split('-');
    if (fragments.length === 2 && fragments[0] === fragments[1]) {
      momentLocale = fragments[0]; // Converts 'fr-fr' to 'fr'
    }
    return momentLocale;
  }

  public static changeMomentLocaleGlobally(currentLocale: string): void {
    const momentLocale = Utils.convertToMomentLocale(currentLocale);
    if (moment.locale() !== momentLocale) {
      console.log('Attempt to set moment locale to: ' + momentLocale);
      moment.locale(momentLocale);
      console.log('Moment Locale as been set to: ' + moment.locale());
      console.log('List of loaded locales: ' + moment.locales());
      console.log(
        'Current format -  Date: ' + moment().format('LL') + '- time: ' + moment().format('LT')
      );
    }
  }

  public static generateDateWithDelay(
    days?: number,
    hours?: number,
    minutes?: number,
    seconds?: number
  ): Date {
    return new Date(
      Date.now() + 3600 * 1000 * 24 * days + 3600 * 1000 * hours + 3600 * minutes + seconds
    );
  }

  public static createSortFieldParam(
    field: string,
    order: string = Constants.ORDERING.asc
  ): Ordering {
    if (order === Constants.ORDERING.desc) {
      return { field: `-${field}` };
    }
    return { field: `${field}` };
  }

  public static replaceAll(input: string, pattern: string, replacement: string = ''): string {
    return input.split(pattern).join(replacement);
  }

  public static handleReservationErrorResponse(
    error: any,
    messageService: MessageService,
    router: Router,
    centralServerService: CentralServerService
  ): void {
    switch (error.status) {
      case HTTPError.RESERVATION_COLLISION_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.collision');
        break;
      case HTTPError.RESERVATION_REJECTED_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.rejected');
        break;
      case HTTPError.RESERVATION_FAULTED_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.faulted');
        break;
      case HTTPError.RESERVATION_OCCUPIED_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.occupied');
        break;
      case HTTPError.RESERVATION_UNAVAILABLE_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.unavailable');
        break;
      case HTTPError.RESERVATION_MULTIPLE_RESERVE_NOW_ERROR:
        messageService.showErrorMessage('reservations.action_error.general.multiple_reserve_now');
        break;
      default:
        Utils.handleHttpError(
          error,
          router,
          messageService,
          centralServerService,
          'reservations.dialog.update.error'
        );
    }
  }

  public static getReservationType(
    reservationType: ReservationType,
    translateService: TranslateService
  ): string {
    switch (reservationType) {
      case ReservationType.RESERVE_NOW:
        return translateService.instant('reservations.types.reserve_now');
      case ReservationType.PLANNED_RESERVATION:
        return translateService.instant('reservations.types.planned_reservation');
      default:
        return translateService.instant('reservations.types.unknown');
    }
  }

  public static getConnectorType(
    translateService: TranslateService,
    connectorType: string
  ): string {
    switch (connectorType) {
      case ConnectorType.CHADEMO:
        return translateService.instant('chargers.connector_type_chademo');
      case ConnectorType.COMBO_CCS:
        return translateService.instant('chargers.connector_type_combo');
      case ConnectorType.DOMESTIC:
        return translateService.instant('chargers.connector_type_domestic');
      case ConnectorType.TYPE_1:
        return translateService.instant('chargers.connector_type_type1');
      case ConnectorType.TYPE_1_CCS:
        return translateService.instant('chargers.connector_type_type1ccs');
      case ConnectorType.TYPE_2:
        return translateService.instant('chargers.connector_type_type2');
      case ConnectorType.TYPE_3_C:
        return translateService.instant('chargers.connector_type_type3c');
      case ConnectorType.UNKNOWN:
        return translateService.instant('chargers.connector_type_unknown');
    }
  }

  public static buildDateTimeObject(
    date: Date,
    dateTime: Date,
    hours?: number,
    minutes?: number
  ): Date {
    const parsedDateTime = dateTime ? moment(dateTime) : moment({ hours, minutes });
    return moment(date).hours(parsedDateTime.hours()).minutes(parsedDateTime.minutes()).toDate();
  }
}
