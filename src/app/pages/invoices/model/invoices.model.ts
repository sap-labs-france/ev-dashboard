import { Role } from 'app/types/Authorization';
import { KeyValue } from 'app/types/GlobalType';
import { UserRole, UserStatus } from 'app/types/User';
import { InvoiceStatus } from '../../../types/Billing';

export const invoicesStatuses: KeyValue[] = [
  { key: InvoiceStatus.PAID, value: 'billing.invoices.paid' },
  { key: InvoiceStatus.UNPAID, value: 'billing.invoices.unpaid' },
];
