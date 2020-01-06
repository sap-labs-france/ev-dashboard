import { KeyValue } from 'app/types/GlobalType';

export const transactionRefundStatus: KeyValue[] = [
  {key: 'notSubmitted', value: 'transactions.refund_undefined'},
  {key: 'submitted', value: 'transactions.refund_submitted'},
  {key: 'cancelled', value: 'transactions.refund_cancelled'},
  {key: 'approved', value: 'transactions.refund_approved'},
];
