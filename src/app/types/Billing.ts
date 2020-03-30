import { Data } from './Table';

export enum BillingInvoiceStatus {
  PAID = 'paid',
  OPEN = 'open',
  PENDING = 'pending',
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
  number: string;
  status: BillingInvoiceStatus;
  amountDue: number;
  currency: string;
  customerID: string;
  date: Date;
  downloadUrl: string;
  payUrl: string;
}

export enum BillingButtonAction {
  PAY_INVOICE = 'Pay',
}
