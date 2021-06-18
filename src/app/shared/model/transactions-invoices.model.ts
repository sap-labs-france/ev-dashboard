import { BillingInvoiceStatus } from '../../types/Billing';
import { KeyValue } from '../../types/GlobalType';

export const TRANSACTION_INVOICE_STATUS: KeyValue[] = [
  { key: BillingInvoiceStatus.PAID, value: 'invoices.status.paid' },
  { key: BillingInvoiceStatus.OPEN, value: 'invoices.status.unpaid' },
  { key: BillingInvoiceStatus.DRAFT, value: 'invoices.status.draft' },
  { key: BillingInvoiceStatus.DELETED, value: 'invoices.status.deleted' },
  { key: BillingInvoiceStatus.UNCOLLECTIBLE, value: 'invoices.status.uncollectible' },
  { key: BillingInvoiceStatus.VOID, value: 'invoices.status.void' },
];
