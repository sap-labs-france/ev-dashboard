import { Utils } from 'utils/Utils';

import { TableFilter } from '../../../shared/table/filters/table-filter';
import { ChargePointStatus } from '../../../types/ChargingStation';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class AvailabilityTableFilter extends TableFilter {
  public constructor() {
    super();
    // Get List of translated values:
    const statuses = Object.keys(ChargePointStatus);
    const translatedStatuses: KeyValue[]= [];
    statuses.forEach((key) => {
      if (key !== ChargePointStatus.OCCUPIED.toUpperCase()) { //How to get the key not the value ?
        translatedStatuses.push({
          key,
          value: 'chargers.status_' + ChargePointStatus[key].toLowerCase()
        });
      }
    });
    // translatedStatuses.sort(Utils.sortArrayOfKeyValue); // Cannot sort because values are not yet translated

    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'Status',
      type: FilterType.DROPDOWN,
      name: 'users.status',
      class: 'col-md-6 col-lg-4 col-xl-2',
      label: '',
      currentValue: [],
      items: Object.assign([], translatedStatuses),
      multiple: true,
    };
    this.setFilterDef(filterDef);
  }
}
