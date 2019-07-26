import { TableFilterDef } from '../../../common.types';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { logLevels } from '../logs.model';

export class LogLevelTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'level',
      httpId: 'Level',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'logs.levels',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      currentValue: [],
      items: Object.assign([], logLevels),
      multiple: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
