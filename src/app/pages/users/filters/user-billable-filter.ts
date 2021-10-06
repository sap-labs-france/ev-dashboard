import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class UserBillableFilter extends TableFilter {
  public constructor(defaultValue = false) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'billable',
      httpId: 'Billable',
      type: FilterType.DROPDOWN,
      multiple: true,
      exhaustive: true,
      name: 'users.billable',
      class: 'col-md-6 col-lg-3 col-xl-2',
      label: 'users.billable',
      cleared: true,
      currentValue: defaultValue,
      items: Object.assign([], billableValues),
    };
    this.setFilterDef(filterDef);
  }
}

export const billableValues: KeyValue[] = [
  { key: 'true', value: 'users.billable' },
  { key: 'false', value: 'users.non_billable' },
];
