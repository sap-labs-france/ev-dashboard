export enum ConsumptionChartDatasetOrder {
  INSTANT_WATTS = 0,
  INSTANT_WATTS_L1,
  INSTANT_WATTS_L2,
  INSTANT_WATTS_L3,
  INSTANT_AMPS,
  INSTANT_AMPS_L1,
  INSTANT_AMPS_L2,
  INSTANT_AMPS_L3,
  INSTANT_AMPS_DC,
  CUMULATED_CONSUMPTION_WH,
  CUMULATED_CONSUMPTION_AMPS,
  LIMIT_WATTS,
  LIMIT_AMPS,
  STATE_OF_CHARGE,
  GRID_MONITORING_LEVEL,
  INSTANT_VOLTS,
  INSTANT_VOLTS_DC,
  INSTANT_VOLTS_L1,
  INSTANT_VOLTS_L2,
  INSTANT_VOLTS_L3,
  AMOUNT,
  CUMULATED_AMOUNT,
  ASSET_CONSUMPTION_WATTS,
  ASSET_PRODUCTION_WATTS,
  CHARGING_STATION_CONSUMPTION_WATTS,
  NET_CONSUMPTION_WATTS,
  ASSET_CONSUMPTION_AMPS,
  ASSET_PRODUCTION_AMPS,
  CHARGING_STATION_CONSUMPTION_AMPS,
  NET_CONSUMPTION_AMPS,
  PLAN_WATTS,
  PLAN_AMPS,
};

export enum ChartTypeValues {
  PIE = 'pie',
  BAR = 'bar',
  STACKED_BAR = 'stackedBar'
};

export enum ConsumptionChartAxis {
  X = 'x',
  AMPERAGE = 'Amperage',
  POWER = 'Power',
  PERCENTAGE = 'Percentage',
  VOLTAGE = 'Voltage',
  AMOUNT = 'Amount',
}
