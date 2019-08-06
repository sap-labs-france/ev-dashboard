import { TableFilterDef } from '../../../common.types';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { transactionTypes } from '../model/transactions-types.model';

export class TransactionsTypeFilter extends TableFilter {
  constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'transactionType',
      httpId: 'Type',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'transactions.filter.type.name',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label:'',
      currentValue: [],
      items: Object.assign([], transactionTypes),
      multiple: true
    };
    this.setFilterDef(filterDef);
  }
}
