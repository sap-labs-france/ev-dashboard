import { sources } from '../../../shared/model/logs.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogSourceTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'source',
      httpID: 'Source',
      type: FilterType.DROPDOWN,
      name: 'logs.source',
      label: '',
      currentValue: [],
      items: Object.assign([], sources),
      multiple: true,
      exhaustive: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
