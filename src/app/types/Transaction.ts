import { BillingTransactionData } from './Billing';
import { Car, CarCatalog } from './Car';
import { ChargingStation } from './ChargingStation';
import Consumption from './Consumption';
import { RefundStatus, RefundType } from './Refund';
import { Data } from './Table';
import { User } from './User';
import { OCPICdr } from './ocpi/OCPICdr';
import { OCPISession } from './ocpi/OCPISession';

export interface Transaction extends Data {
  id: number;
  timestamp: Date;
  chargeBox: ChargingStation;
  chargeBoxID: string;
  siteAreaID: string;
  connectorId: number;
  meterStart: number;
  issuer: boolean;
  currentInstantWatts: number;
  currentInstantWattsL1?: number;
  currentInstantWattsL2?: number;
  currentInstantWattsL3?: number;
  currentInstantWattsDC?: number;
  currentInstantVolts?: number;
  currentInstantVoltsL1?: number;
  currentInstantVoltsL2?: number;
  currentInstantVoltsL3?: number;
  currentInstantVoltsDC?: number;
  currentInstantAmps?: number;
  currentInstantAmpsL1?: number;
  currentInstantAmpsL2?: number;
  currentInstantAmpsL3?: number;
  currentInstantAmpsDC?: number;
  currentTotalConsumptionWh: number;
  currentTotalInactivitySecs: number;
  currentInactivityStatus: InactivityStatus;
  currentTotalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  siteID: string;
  user: User;
  tagID: string;
  carID?: string;
  car?: Car;
  carCatalogID?: string;
  carCatalog?: CarCatalog;
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
    totalConsumptionWh: number;
    stateOfCharge: number;
    totalInactivitySecs: number;
    totalDurationSecs: number;
    price: number;
    priceUnit: string;
    inactivityStatus: InactivityStatus;
  };
  dateTimestring: string;
  values: Consumption[];
  ocpi?: boolean;
  ocpiWithCdr?: boolean;
  billingData: BillingTransactionData;
  ocpiData?: OcpiData;
}

export interface OcpiData {
  session?: OCPISession;
  cdr?: OCPICdr;
  sessionCheckedOn?: Date;
  cdrCheckedOn?: Date;
}

export interface StartTransaction {
  userFullName: string;
  tagID: string;
  carID?: string;
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
  EXPORT_TRANSACTION_OCPI_CDR = 'export_transaction_ocpi_cdr',
  OPEN_CONCUR_URL = 'open_concur_url',
  REFUND_TRANSACTIONS = 'refund_transactions',
  REFUND_SYNCHRONIZE = 'refund_synchronize',
  PUSH_TRANSACTION_CDR = 'push_transaction_cdr',
  CREATE_TRANSACTION_INVOICE = 'create_transaction_invoice',
  REBUILD_TRANSACTION_CONSUMPTIONS = 'rebuild_transaction_consumptions',
  NAVIGATE_TO_TRANSACTIONS = 'navigate_to_transactions'
}

export enum ConsumptionUnit {
  AMPERE = 'A',
  KILOWATT = 'kW',
}
