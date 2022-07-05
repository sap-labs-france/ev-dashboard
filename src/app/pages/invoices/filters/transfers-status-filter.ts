import { TRANSFER_STATUS } from 'shared/model/transfers-status.model';

import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class TransfersStatusFilter extends TableFilter {
  public constructor() {
    super();
    const filterDef: TableFilterDef = {
      id: 'transferStatus',
      httpId: 'Status',
      type: FilterType.DROPDOWN,
      name: 'general.status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], TRANSFER_STATUS),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
