import { TableFilterDef } from 'app/common.types';
import { TableFilter } from 'app/shared/table/filters/table-filter';
import { Constants } from 'app/utils/Constants';
import { logHosts } from '../model/logs.model';

export class LogHostTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'host',
      httpId: 'Host',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'logs.host',
      class: 'col-md-4 col-lg-4 col-xl-2',
      currentValue: [],
      items: Object.assign([], logHosts),
      multiple: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
