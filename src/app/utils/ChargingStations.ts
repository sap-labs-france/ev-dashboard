import { Charger, KeyValue } from 'app/common.types';

export class ChargingStations {
  public static convertAmpToW(numberOfConnectedPhase, maxIntensityInAmper) {
    // Compute it
    if (numberOfConnectedPhase === 0 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    } else if (numberOfConnectedPhase === 3 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    } else {
      return Math.floor(230 * maxIntensityInAmper);
    }
  }

  public static convertWToAmp(numberOfConnectedPhase, maxIntensityInW) {
    // Compute it
    if (numberOfConnectedPhase === 0) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    } else if ( numberOfConnectedPhase === 3) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    } else {
      return Math.round(maxIntensityInW / 230);
    }
  }

  public static provideLimit(charger: Charger, value: number) {
    // Test purpose as it seems that schneider needs to have the power value for each connector
    if (charger.chargePointVendor === 'Schneider Electric' && charger.chargePointModel === 'MONOBLOCK') {
      return Math.round(value / 2);
    } else {
      return value;
    }
  }

  public static getListOfMissingSettings(charger: Charger) {
    return MANDATORY_SETTINGS_LIST.filter((mandatorySetting) => {
      if (mandatorySetting.key.startsWith('connectors.')) {
        for (const connector of charger.connectors) {
          return !mandatorySetting.isOK(connector[mandatorySetting.key.replace('connectors.', '')]);
        }
      } else {
        return (!mandatorySetting.isOK(charger[mandatorySetting.key]));
      }
    });
  }
}

export const MANDATORY_SETTINGS_LIST = [
  {key: 'maximumPower', value: 'chargers.maximum_energy', isOK: (value) => {
    return value && value > 0;
  } },
  {key: 'chargePointModel', value: 'chargers.model', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'chargePointVendor', value: 'chargers.vendor', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'numberOfConnectedPhase', value: 'chargers.nb_connected_phase', isOK: (value) => {
    return value && value > 0;
  }},
  {key: 'powerLimitUnit', value: 'chargers.power_limit_unit', isOK: (value) => {
    return value && (value === 'A' || value === 'W');
  }},
  {key: 'chargingStationURL', value: 'chargers.charger_url', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'cannotChargeInParallel', value: 'chargers.cant_charge_in_parallel', isOK: (value) => {
    return true;
  }},
  {key: 'connectors.type', value: 'chargers.connector_type', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'connectors.power', value: 'chargers.connector_max_power', isOK: (value) => {
    return value && value > 0;
  }},
];
