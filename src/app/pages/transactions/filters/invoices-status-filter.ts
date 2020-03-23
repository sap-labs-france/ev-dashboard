import { FilterType, TableFilterDef } from 'app/types/Table';
import { invoicesStatuses } from '../model/invoices.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';

export class InvoiceStatusFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'Status',
      type: FilterType.DROPDOWN,
      name: 'general.status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], invoicesStatuses),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
