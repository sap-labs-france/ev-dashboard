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
  instantAmps: number;
  cumulatedConsumption: number;
  cumulatedConsumptionAmps: number;
  stateOfCharge: number;
  cumulatedAmount: number;
  currencyCode: string;
  limitWatts: number;
  limitAmps: number;
}

export enum InactivityStatus {
  INFO = 'I',
  WARNING = 'W',
  ERROR = 'E',
}

export enum TransactionButtonAction {
  VIEW_TRANSACTION = 'view_transaction',
  EDIT_TRANSACTION = 'edit_transaction',
  CREATE_TRANSACTION = 'create_transaction',
  DELETE_TRANSACTION = 'delete_transaction',
  DELETE_TRANSACTIONS = 'delete_transactions',
  EXPORT_TRANSACTIONS = 'export_transactions',
  OPEN_CONCUR_URL = 'open_concur_url',
  REFUND_TRANSACTIONS = 'refund_transactions',
}

export enum ConsumptionUnit {
  AMPERE = 'A',
  KILOWATT = 'kW',
}
