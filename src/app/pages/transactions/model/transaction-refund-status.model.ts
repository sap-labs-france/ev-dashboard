import { KeyValue } from 'app/types/GlobalType';
import { RefundStatus } from 'app/types/Refund';

export const transactionRefundStatus: KeyValue[] = [
  {key: RefundStatus.NOT_SUBMITTED, value: 'transactions.refund_undefined'},
  {key: RefundStatus.SUBMITTED, value: 'transactions.refund_submitted'},
  {key: RefundStatus.CANCELLED, value: 'transactions.refund_cancelled'},
  {key: RefundStatus.APPROVED, value: 'transactions.refund_approved'},
];
