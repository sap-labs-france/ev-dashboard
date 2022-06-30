import { BillingAccountStatus } from '../../types/Billing';
import { KeyValue } from '../../types/GlobalType';

export const SUBACCOUNT_STATUS: KeyValue[] = [
  { key: BillingAccountStatus.IDLE, value: 'settings.billing.stripe_subaccount.status_idle' },
  { key: BillingAccountStatus.PENDING, value: 'settings.billing.stripe_subaccount.status_pending' },
  { key: BillingAccountStatus.ACTIVE, value: 'settings.billing.stripe_subaccount.status_active' },
];
