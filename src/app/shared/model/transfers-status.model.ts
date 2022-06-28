import { BillingTransferStatus } from '../../types/Billing';
import { KeyValue } from '../../types/GlobalType';

export const TRANSFER_STATUS: KeyValue[] = [
  { key: BillingTransferStatus.DRAFT, value: 'transfers.status.draft' },
  { key: BillingTransferStatus.PENDING, value: 'transfers.status.pending' },
  { key: BillingTransferStatus.FINALIZED, value: 'transfers.status.finalized' },
  { key: BillingTransferStatus.TRANSFERRED, value: 'transfers.status.transferred' },
];
