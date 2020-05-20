import { ChargingStation, ChargingStationCurrentType, PowerLimitUnits } from 'app/types/ChargingStation';

export class ChargingStations {
  public static provideLimit(charger: ChargingStation, value: number): number {
    // Test purpose as it seems that schneider needs to have the power value for each connector
    if (charger.chargePointVendor === 'Schneider Electric' && charger.chargePointModel === 'MONOBLOCK') {
      return Math.round(value / 2);
    }
    return value;
  }
}
