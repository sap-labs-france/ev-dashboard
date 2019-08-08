import { TableFilterDef } from '../../../common.types';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { userStatuses } from '../users.model';

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
      label: '',
      currentValue: [],
      items: Object.assign([], userStatuses),
      multiple: true
    };
    this.setFilterDef(filterDef);
  }
}
