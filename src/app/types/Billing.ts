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
  invoiceID: string;
  number: string;
  status: BillingInvoiceStatus;
  amountDue: number;
  currency: string;
  customerID: string;
  date: Date;
  payUrl: string;
  downloadable: boolean;
}

export enum BillingButtonAction {
  PAY_INVOICE = 'pay_invoice',
  SYNCHRONIZE_BILLING_USERS = 'synchronize_billing_users',
  SYNCHRONIZE_INVOICES = 'synchronize_invoices',
  DOWNLOAD_INVOICE = 'download_invoice'
}
