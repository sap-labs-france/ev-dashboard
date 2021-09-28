import { CentralServerService } from '../../../services/central-server.service';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class UserTechnicalFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'technical',
      httpId: 'Technical',
      type: FilterType.SWITCH,
      name: 'users.technical',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: 'users.technical',
      currentValue: true,
    };
    this.setFilterDef(filterDef);
  }
}
