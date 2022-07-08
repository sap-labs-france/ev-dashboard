import { BillingAccountStatus } from '../../types/Billing';
import { KeyValue } from '../../types/GlobalType';

export const ACCOUNT_STATUS: KeyValue[] = [
  { key: BillingAccountStatus.IDLE, value: 'settings.billing.connected_account.status_idle' },
  { key: BillingAccountStatus.PENDING, value: 'settings.billing.connected_account.status_pending' },
  { key: BillingAccountStatus.ACTIVE, value: 'settings.billing.connected_account.status_active' },
];
