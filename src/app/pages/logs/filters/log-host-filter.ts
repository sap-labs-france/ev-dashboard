import { LOG_HOSTS } from '../../../shared/model/logs.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogHostTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'host',
      httpId: 'Host',
      type: FilterType.DROPDOWN,
      name: 'logs.host',
      class: 'col-md-4 col-lg-4 col-xl-2',
      currentValue: [],
      items: Object.assign([], LOG_HOSTS),
      multiple: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
