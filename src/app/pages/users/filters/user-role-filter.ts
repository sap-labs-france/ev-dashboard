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
      name: 'users.roles',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role),
      multiple: true
    };
    this.setFilterDef(filterDef);
  }
}
