export interface AbstractConsumption {
  instantWatts: number;
  instantWattsL1: number;
  instantWattsL2: number;
  instantWattsL3: number;
  instantWattsDC: number;
  instantAmps: number;
  instantAmpsL1: number;
  instantAmpsL2: number;
  instantAmpsL3: number;
  instantAmpsDC: number;
  instantVolts: number;
  instantVoltsL1: number;
  instantVoltsL2: number;
  instantVoltsL3: number;
  instantVoltsDC: number;
  consumptionWh: number;
  consumptionAmps: number;
  lastMetricWh: number;
  lastMetric: Date;
}

export default interface Consumption extends AbstractConsumption {
}
