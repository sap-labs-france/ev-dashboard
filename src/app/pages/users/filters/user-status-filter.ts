import {TableFilter} from '../../../shared/table/filters/table-filter';
import {Constants} from '../../../utils/Constants';
import {TableFilterDef} from '../../../common.types';
import {UserStatuses} from '../users.model';

export class UserStatusFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'Status',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'users.status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      currentValue: Constants.FILTER_ALL_KEY,
      items: Object.assign([], UserStatuses)
    };
    // Add <All>
    filterDef.items.unshift({key: Constants.FILTER_ALL_KEY, value: 'general.all'});
    this.setFilterDef(filterDef);
  }
}
