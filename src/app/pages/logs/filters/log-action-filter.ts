import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { logActions } from '../model/logs.model';

export class LogActionTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'action',
      httpId: 'Action',
      type: FilterType.DROPDOWN,
      name: 'logs.actions',
      class: 'col-md-6 col-lg-4 col-xl-2',
      currentValue: [],
      items: Object.assign([], logActions),
      multiple: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
