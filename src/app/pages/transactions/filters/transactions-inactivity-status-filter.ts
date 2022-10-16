import { TRANSACTION_INACTIVITY_STATUS } from '../../../shared/model/transaction-inactivity-status.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class TransactionsInactivityStatusFilter extends TableFilter {
  public constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'inactivityStatus',
      httpId: 'InactivityStatus',
      type: FilterType.DROPDOWN,
      name: 'transactions.inactivity',
      label: '',
      currentValue: [],
      items: Object.assign([], TRANSACTION_INACTIVITY_STATUS),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
