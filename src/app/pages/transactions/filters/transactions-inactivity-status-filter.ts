import { FilterType, TableFilterDef } from 'app/types/Table';

import { TableFilter } from '../../../shared/table/filters/table-filter';
import { transactionInactivityStatus } from '../model/transaction-inactivity-status.model';

export class TransactionsInactivityStatusFilter extends TableFilter {
  constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'inactivityStatus',
      httpId: 'InactivityStatus',
      type: FilterType.DROPDOWN,
      name: 'transactions.inactivity',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], transactionInactivityStatus),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
