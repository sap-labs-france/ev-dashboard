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

export interface BillingInvoice extends TableData {
  id: string;
  createdOn?: Date;
  invoiceID: string;
  user: User;
  currentUserID: string;
  userID?: string;
  // eslint-disable-next-line id-blacklist
  number: string;
  status: BillingInvoiceStatus;
  amount?: number;
  currency: string;
  downloadable: boolean;
  sessions: BillingSessionData[];
  // TODO : necessary the download url ??
  downloadUrl: string;
  amountWithCurrency?: string;
}

export interface BillingSessionData {
  transactionID: number;
  description: string;
  pricingData: any;
}

export enum BillingButtonAction {
  PAY_INVOICE = 'pay_invoice',
  SYNCHRONIZE_BILLING_USERS = 'synchronize_billing_users',
  SYNCHRONIZE_INVOICES = 'synchronize_invoices',
  DOWNLOAD_INVOICE = 'download_invoice',
  CREATE_PAYMENT_METHOD = 'create_payment_method',
  DELETE_PAYMENT_METHOD = 'delete_payment_method',
  VIEW_INVOICE = 'view_invoice'
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

export interface BillingPaymentMethod {
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
  currentInvoiceID?: string;
  currentUserID?: string;
}
