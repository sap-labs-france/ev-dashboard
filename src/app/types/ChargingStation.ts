import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { InactivityStatus } from './Transaction';

export interface ChargingStationConfiguration {
  chargeBoxID: string;
  timestamp: Date;
  configuration: [
    {
      value: string;
      readonly: boolean;
      key: string;
    }];
}

export interface ConsumptionValue {
  date: Date;
  value: number;
  cumulated: number;
  amount: number;
  price: number;
  stateOfCharge: number;
  unroundedAmount: number;
  cumulatedAmount: number;
  currencyCode: string;
  pricingSource: string;
}

export interface Connector extends Data {
  connectorId: number;
  currentConsumption: number;
  currentStateOfCharge?: number;
  totalInactivitySecs?: number;
  totalConsumption?: number;
  status: string;
  errorCode?: string;
  info?: string;
  vendorErrorCode?: string;
  power: number;
  type: string;
  voltage?: number;
  amperage?: number;
  activeTransactionID: number;
  activeTransactionDate: Date;
  activeTagID: string;
  statusLastChangedOn?: Date;
  inactivityStatus: InactivityStatus;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
}

export interface ChargingStation extends Data {
  id: string;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialnumber: string;
  chargeBoxSerialnumber: string;
  firmwareVersion: string;
  iccid: string;
  imsi: string;
  lastReboot: Date;
  meterType: string;
  meterSerialnumber: string;
  endpoint: string;
  ocppVersion: string;
  lastHeartBeat: Date;
  inactive: boolean;
  chargingStationURL: string;
  numberOfConnectedPhase: number;
  connectors: Connector[];
  siteArea: SiteArea;
  cannotChargeInParallel: boolean;
  maximumPower: number;
  powerLimitUnit: string;
  coordinates: number[];
  currentIPAddress: string;
}
