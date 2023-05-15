import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class StatusFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'status',
      httpId: 'Active',
      type: FilterType.DROPDOWN,
      name: 'tags.status',
      class: 'col-md-6 col-lg-2 col-xl-2',
      label: '',
      items: Object.assign([], status),
      multiple: true,
      exhaustive: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}

export const status: KeyValue[] = [
  { key: 'true', value: 'tags.activated' },
  { key: 'false', value: 'tags.deactivated' },
];
