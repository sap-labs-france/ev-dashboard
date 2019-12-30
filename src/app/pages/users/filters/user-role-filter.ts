import { TableFilterDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { UserRoles } from '../model/users.model';

export class UserRoleFilter extends TableFilter {
  constructor(
    private centralServerService: CentralServerService) {
    super();
    const items = UserRoles.getAvailableRoles(this.centralServerService.getLoggedUser().role);
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'role',
      httpId: 'Role',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'users.roles',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: items ? items : undefined,
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
