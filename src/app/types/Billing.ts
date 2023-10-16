import {
  BillingInvoiceAuthorizationActions,
  BillingPaymentMethodAuthorizationActions,
  BillingTransferAuthorizationActions,
} from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { BillingSettings } from './Setting';
import { TableData } from './Table';
import { User } from './User';

export enum BillingInvoiceStatus {
  PAID = 'paid',
  OPEN = 'open',
  DRAFT = 'draft',
  UNCOLLECTIBLE = 'uncollectible',
  DELETED = 'deleted',
  VOID = 'void',
}

export interface BillingTax extends TableData {
  description: string;
  displayName: string;
  percentage: number;
}

export interface BillingUserData extends TableData {
  hasSynchroError: boolean;
}

export interface BillingInvoice extends TableData, BillingInvoiceAuthorizationActions {
  id: string;
  createdOn?: Date;
  invoiceID: string;
  userID?: string;
  user?: User;
  // eslint-disable-next-line id-blacklist
  number: string;
  status: BillingInvoiceStatus;
  amount?: number;
  currency: string;
  downloadable: boolean;
  sessions: BillingSessionData[];
}

export interface BillingSessionData {
  transactionID: number;
  description: string;
  pricingData: any;
}

export enum BillingButtonAction {
  PAY_INVOICE = 'pay_invoice',
  DOWNLOAD_INVOICE = 'download_invoice',
  CREATE_PAYMENT_METHOD = 'create_payment_method',
  DELETE_PAYMENT_METHOD = 'delete_payment_method',
  ONBOARD_CONNECTED_ACCOUNT = 'onboard_connected_account',
}

export interface BillingTransactionData {
  status?: string;
  invoiceID?: string;
  invoiceStatus?: BillingInvoiceStatus;
  invoiceItem?: BillingInvoiceItem;
  lastUpdate?: Date;
}

export interface BillingInvoiceItem {
  description: string;
  amount: number;
  taxes?: string[];
}

export interface BillingPaymentMethod extends BillingPaymentMethodAuthorizationActions {
  id: string;
  brand: string;
  expiringOn: string;
  last4: number;
  type: string;
  createdOn: Date;
  isDefault: boolean;
}

export interface PaymentDialogData extends TableData {
  userId: string;
  setting: BillingSettings;
}

export enum BillingAccountStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  ACTIVE = 'active',
}

export interface BillingPlatformFeeStrategy {
  flatFeePerSession: number; // e.g.: 0.25 per charging session
  percentage: number; // e.g.: 2% per charging session
}

export interface BillingAccount extends CreatedUpdatedProps, BillingTransferAuthorizationActions {
  id: string;
  businessOwnerID: string;
  businessOwner?: User;
  companyName?: string;
  status?: BillingAccountStatus;
  activationLink?: string;
  accountExternalID?: string;
}

export interface BillingAccountData {
  accountID: string;
  account?: BillingAccount;
  platformFeeStrategy?: BillingPlatformFeeStrategy;
}

export interface BillingSessionAccountData extends BillingAccountData {
  withTransferActive: boolean;
}

export enum BillingTransferStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  FINALIZED = 'finalized',
  TRANSFERRED = 'transferred',
}

export interface BillingPlatformFeeData {
  taxExternalID: string; // Tax to apply on the platform fee
  feeAmount: number;
  feeTaxAmount: number;
  invoiceExternalID?: string; // Invoice sent to the CPO
}

export interface BillingTransfer
  extends TableData,
  CreatedUpdatedProps,
  BillingTransferAuthorizationActions {
  id: string;
  status: BillingTransferStatus;
  sessionCounter: number; // Number of transactions
  collectedFunds: number; // Total amount of the priced transactions
  collectedFlatFees: number;
  collectedFees: number; // Total amount of the platform fee collected
  totalConsumptionWh: number;
  totalDurationSecs: number;
  transferAmount: number; // Amount transferred after applying platform fees
  accountID: string;
  account?: BillingAccount;
  businessOwner?: User;
  platformFeeData: BillingPlatformFeeData;
  transferExternalID: string; // Transfer sent to the CPO
  currency: string;
  invoice?: BillingPlatformInvoice; // The invoice generated to bill the platform fee
}

// Very important - preserve maximal precision - Decimal type is persisted as an object in the DB
// export type BillingAmount = Decimal.Value;

export interface BillingPlatformInvoice {
  invoiceID: string;
  liveMode: boolean;
  userID: string;
  documentNumber: string;
  status: BillingInvoiceStatus;
  amount: number; // This one is in cents
  totalAmount: number;
  currency: string;
  customerID: string;
  createdOn: Date;
}

export enum TransferButtonAction {
  VIEW_TRANSFER = 'view_transfer',
  EXPORT_TRANSFERS = 'export_transfers',
  FINALIZE_TRANSFER = 'finalize_transfer',
  SEND_TRANSFER = 'send_transfer',
  DOWNLOAD_COMMISSION_INCOICE = 'download_commission_invoice',
}
