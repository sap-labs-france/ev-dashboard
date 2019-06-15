import { TableFilterDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { UserRoles } from '../users.model';

export class UserRoleFilter extends TableFilter {
  constructor(
    private centralServerService: CentralServerService) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'role',
      httpId: 'Role',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'users.role',
      class: 'col-md-6 col-lg-4 col-xl-2',
      currentValue: Constants.FILTER_ALL_KEY,
      items: UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role)
    };
    // Add <All>
    filterDef.items.unshift({key: Constants.FILTER_ALL_KEY, value: 'general.all'});
    this.setFilterDef(filterDef);
  }
}
