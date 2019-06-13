import { TableFilter } from 'app/shared/table/filters/table-filter';
import { TableFilterDef } from 'app/common.types';
import { Constants } from 'app/utils/Constants';

export class LogHostTableFilter extends TableFilter {
  constructor() {
    super();
    let host: string;
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'host',
      httpId: 'Host',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'logs.host',
      class: 'col-md-4 col-lg-4 col-xl-2',
      currentValue: Constants.FILTER_ALL_KEY,
      items: Object.assign([], host)
    };
    // Add <All>
    filterDef.items.unshift({key: Constants.FILTER_ALL_KEY, value: 'general.all'});
    // Set
    this.setFilterDef(filterDef);
  }
}
