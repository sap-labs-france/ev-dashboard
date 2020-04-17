import { ChargingStation } from './ChargingStation';
import { RefundStatus, RefundType } from './Refund';
import { Data } from './Table';
import { User } from './User';

export interface Transaction extends Data {
  id: number;
  timestamp: Date;
  chargeBox: ChargingStation;
  chargeBoxID: string;
  siteAreaID: string;
  connectorId: number;
  meterStart: number;
  currentConsumption: number;
  currentTotalConsumption: number;
  currentTotalInactivitySecs: number;
  currentInactivityStatus: InactivityStatus;
  currentTotalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  isLoading: boolean;
  siteID: string;
  user: User;
  tagID: string;
  status: string;
  price: number;
  priceUnit: string;
  refundData: {
    reportId: string;
    refundedAt: Date;
    type: RefundType;
    refundId: string;
    status: RefundStatus;
  };
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    stateOfCharge: number;
    totalInactivitySecs: number;
    totalDurationSecs: number;
    price: number;
    priceUnit: string;
    inactivityStatus: InactivityStatus;
  };
  dateTimestring: string;
  values: ConsumptionValue[];
}

export interface ConsumptionValue {
  date: Date;
  instantPower: number;
  cumulatedConsumption: number;
  stateOfCharge: number;
  cumulatedAmount: number;
  currencyCode: string;
  limitWatts: number;
}

export enum InactivityStatus {
  INFO = 'I',
  WARNING = 'W',
  ERROR = 'E',
}

export enum TransactionButtonAction {
  REFUND = 'refund',
  OPEN_IN_CONCUR = 'open_in_concur',
}
