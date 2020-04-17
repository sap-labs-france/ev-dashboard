import { ChargingStation, ChargingStationCurrentType, PowerLimitUnits } from 'app/types/ChargingStation';

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
}
