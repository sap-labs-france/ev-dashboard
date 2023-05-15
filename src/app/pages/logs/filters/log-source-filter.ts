import { sources } from '../../../shared/model/logs.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogSourceTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'source',
      httpId: 'Source',
      type: FilterType.DROPDOWN,
      name: 'logs.source',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      label: '',
      currentValue: [],
      items: Object.assign([], sources),
      multiple: true,
      exhaustive: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
