import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class UserFreeAccessFilter extends TableFilter {
  public constructor(defaultValue = false) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'freeAccess',
      httpId: 'FreeAccess',
      type: FilterType.DROPDOWN,
      multiple: true,
      exhaustive: true,
      name: 'users.access_mode',
      class: 'col-md-6 col-lg-3 col-xl-2',
      label: 'users.access_mode',
      cleared: true,
      currentValue: defaultValue,
      items: Object.assign([], freeAccessValues),
    };
    this.setFilterDef(filterDef);
  }
}

export const freeAccessValues: KeyValue[] = [
  { key: 'true', value: 'users.user_with_freeAccess' },
  { key: 'false', value: 'users.user_without_freeAccess' },
];
