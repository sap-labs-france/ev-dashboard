import { KeyValue } from 'types/GlobalType';

import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class DateMenuDropdownFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'date_menu_dropdown',
      httpId: 'DateMenuDropdown',
      type: FilterType.MENU_DROPDOWN,
      name: 'dateMenuDropdown',
      class: '',
      label: 'event',
      items: Object.assign([], dateMenuOptions),
      multiple: false,
      exhaustive: true
    };
    // Set
    this.setFilterDef(filterDef);
  }
}

export const dateMenuOptions: KeyValue[] = [
  { key: 'search_one_minute', value: 'logs.search_one_minute' },
  { key: 'search_10_minutes', value: 'logs.search_10_minutes' },
  { key: 'search_30_minutes', value: 'logs.search_30_minutes' },
  { key: 'search_one_hour', value: 'logs.search_one_hour' },
  { key: 'search_today', value: 'logs.search_today' },
  { key: 'search_yesterday', value: 'logs.search_yesterday' },
  { key: 'search_this_week', value: 'logs.search_this_week' },
  { key: 'search_last_week', value: 'logs.search_last_week' },
  { key: 'search_this_month', value: 'logs.search_this_month' },
  { key: 'search_last_month', value: 'logs.search_last_month' },
];
