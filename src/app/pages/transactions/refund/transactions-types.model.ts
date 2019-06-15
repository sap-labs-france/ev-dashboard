import { KeyValue } from '../../../common.types';
import { Constants } from '../../../utils/Constants';

export const transactionTypes: KeyValue[] = [
  {key: 'refunded', value: 'transactions.filter.type.refunded'},
  {key: 'notRefunded', value: 'transactions.filter.type.not_refunded'}
];


