import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { transactionRefundStatus } from '../model/transaction-refund-status.model';

export class TransactionsRefundStatusFilter extends TableFilter {
  constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'transactionStatus',
      httpId: 'RefundStatus',
      type: FilterType.DROPDOWN,
      name: 'transactions.state',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], transactionRefundStatus),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
