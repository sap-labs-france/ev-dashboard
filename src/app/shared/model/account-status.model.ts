import { BillingAccountStatus } from '../../types/Billing';
import { KeyValue } from '../../types/GlobalType';

export const ACCOUNT_STATUS: KeyValue[] = [
  { key: BillingAccountStatus.IDLE, value: 'accounts.status.account_idle' },
  { key: BillingAccountStatus.PENDING, value: 'accounts.status.account_pending' },
  { key: BillingAccountStatus.ACTIVE, value: 'accounts.status.account_active' },
];
