import { Data } from './Table';

export enum BillingInvoiceStatus {
  PAID = 'paid',
  OPEN = 'open',
  DRAFT = 'draft',
}

export interface BillingTax extends Data {
  description: string;
  displayName: string;
  percentage: number;
}

export interface BillingUserData extends Data {
  hasSynchroError: boolean;
}

export interface BillingInvoice extends Data {
  id: string;
  createdOn?: Date;
  invoiceID: string;
  userID?: string;
  nbrOfItems?: number;
  number: string;
  status: BillingInvoiceStatus;
  amount?: number;
  currency: string;
  downloadable: boolean;
}

export enum BillingButtonAction {
  PAY_INVOICE = 'pay_invoice',
  SYNCHRONIZE_BILLING_USERS = 'synchronize_billing_users',
  SYNCHRONIZE_INVOICES = 'synchronize_invoices',
  DOWNLOAD_INVOICE = 'download_invoice'
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
