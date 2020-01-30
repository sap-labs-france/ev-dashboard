import { ChargingStation } from 'app/types/ChargingStation';

export class ChargingStations {
  public static convertAmpToW(numberOfConnectedPhase: number, maxIntensityInAmper: number): number {
    // Compute it
    if (numberOfConnectedPhase === 0 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    }
    if (numberOfConnectedPhase === 3 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    }
    return Math.floor(230 * maxIntensityInAmper);
  }

  public static convertWToAmp(numberOfConnectedPhase: number, maxIntensityInW: number): number {
    // Compute it
    if (numberOfConnectedPhase === 0) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    }
    if ( numberOfConnectedPhase === 3) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    }
    return Math.round(maxIntensityInW / 230);
  }

  public static provideLimit(charger: ChargingStation, value: number): number {
    // Test purpose as it seems that schneider needs to have the power value for each connector
    if (charger.chargePointVendor === 'Schneider Electric' && charger.chargePointModel === 'MONOBLOCK') {
      return Math.round(value / 2);
    }
    return value;
  }

  public static getListOfMissingSettings(charger: ChargingStation) {
    return MANDATORY_SETTINGS_LIST.filter((mandatorySetting) => {
      if (mandatorySetting.key.startsWith('connectors.')) {
        for (const connector of charger.connectors) {
          // @ts-ignore
          return !mandatorySetting.isOK(connector[mandatorySetting.key.replace('connectors.', '')]);
        }
      } else {
        // @ts-ignore
        return (!mandatorySetting.isOK(charger[mandatorySetting.key]));
      }
    });
  }
}

export const MANDATORY_SETTINGS_LIST = [
  {key: 'maximumPower', value: 'chargers.maximum_energy', isOK: (value: number) => {
    return value && value > 0;
  } },
  {key: 'chargePointModel', value: 'chargers.model', isOK: (value: string[]) => {
    return value && value.length > 0;
  }},
  {key: 'chargePointVendor', value: 'chargers.vendor', isOK: (value: string[]) => {
    return value && value.length > 0;
  }},
  {key: 'numberOfConnectedPhase', value: 'chargers.nb_connected_phase', isOK: (value: number) => {
    return value && value > 0;
  }},
  {key: 'powerLimitUnit', value: 'chargers.power_limit_unit', isOK: (value: string) => {
    return value && (value === 'A' || value === 'W');
  }},
  {key: 'chargingStationURL', value: 'chargers.charger_url', isOK: (value: string[]) => {
    return value && value.length > 0;
  }},
  {key: 'cannotChargeInParallel', value: 'chargers.cant_charge_in_parallel', isOK: (value: number) => {
    return true;
  }},
  {key: 'connectors.type', value: 'chargers.connector_type', isOK: (value: string[]) => {
    return value && value.length > 0;
  }},
  {key: 'connectors.power', value: 'chargers.connector_max_power', isOK: (value: number) => {
    return value && value > 0;
  }},
];
