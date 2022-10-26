import { TRANSACTION_INVOICE_STATUS } from '../../../shared/model/transactions-invoices.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class InvoiceStatusFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpID: 'Status',
      type: FilterType.DROPDOWN,
      name: 'general.status',
      label: '',
      currentValue: [],
      items: Object.assign([], TRANSACTION_INVOICE_STATUS),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
