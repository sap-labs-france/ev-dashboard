import { TRANSACTION_REFUND_STATUS } from '../../../shared/model/transaction-refund-status.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class TransactionsRefundStatusFilter extends TableFilter {
  public constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'transactionStatus',
      httpID: 'RefundStatus',
      type: FilterType.DROPDOWN,
      name: 'transactions.state',
      label: '',
      currentValue: [],
      items: Object.assign([], TRANSACTION_REFUND_STATUS),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
