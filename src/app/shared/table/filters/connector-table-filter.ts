import { CONNECTORS } from 'shared/model/charging-stations.model';

import { TableFilter } from '../../../shared/table/filters/table-filter';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class ConnectorTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'connector',
      httpId: 'ConnectorID',
      type: FilterType.DROPDOWN,
      name: 'chargers.connector',
      class: 'col-md-6 col-lg-2 col-xl-2',
      label: '',
      items: Object.assign([], CONNECTORS),
      multiple: true,
      exhaustive: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
