import { TableFilter } from '../../../shared/table/filters/table-filter';
import { ChargePointStatus } from '../../../types/ChargingStation';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class AvailabilityTableFilter extends TableFilter {
  public constructor() {

    super();
    // Get List of translated values
    const translatedStatuses: KeyValue[] = [];
    for (const value of Object.values(ChargePointStatus)) {
      translatedStatuses.push({
        key: value,
        value: 'chargers.status_' + value.toLowerCase()
      });
    }
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'ConnectorStatus',
      type: FilterType.DROPDOWN,
      name: 'chargers.connector_status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], translatedStatuses),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
