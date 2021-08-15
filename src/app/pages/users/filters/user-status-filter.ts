import { USER_STATUSES } from '../../../shared/model/users.model';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class UserStatusFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'Status',
      type: FilterType.DROPDOWN,
      name: 'users.status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], USER_STATUSES),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
