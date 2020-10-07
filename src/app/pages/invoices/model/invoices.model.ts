import { KeyValue } from 'app/types/GlobalType';

import { BillingInvoiceStatus } from '../../../types/Billing';

export const invoicesStatuses: KeyValue[] = [
  { key: BillingInvoiceStatus.PAID, value: 'invoices.status.paid' },
  { key: BillingInvoiceStatus.OPEN, value: 'invoices.status.unpaid' },
  { key: BillingInvoiceStatus.DRAFT, value: 'invoices.status.draft' },
];
