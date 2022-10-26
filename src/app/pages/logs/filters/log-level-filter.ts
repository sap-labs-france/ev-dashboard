import { logLevels } from '../../../shared/model/logs.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class LogLevelTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'level',
      httpID: 'Level',
      type: FilterType.DROPDOWN,
      name: 'logs.levels',
      label: '',
      currentValue: [],
      items: Object.assign([], logLevels),
      multiple: true,
      exhaustive: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
