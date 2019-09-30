import { TableFilterDef } from '../../../common.types';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { logActions } from '../model/logs.model';

export class LogActionTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'action',
      httpId: 'Action',
      type: Constants.FILTER_TYPE_DROPDOWN,
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
