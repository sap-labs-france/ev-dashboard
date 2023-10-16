import { logLevels } from '../../../shared/model/logs.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogLevelTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'level',
      httpId: 'Level',
      type: FilterType.DROPDOWN,
      name: 'logs.levels',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      label: '',
      currentValue: [],
      items: Object.assign([], logLevels),
      multiple: true,
      exhaustive: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
