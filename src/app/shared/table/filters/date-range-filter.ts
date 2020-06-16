import { FilterType, TableFilterDef } from 'app/types/Table';

import { TableFilter } from './table-filter';

export class DateRangeFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'timestamp',
      httpId: 'DateRange',
      type: FilterType.DATE_RANGE,
      name: 'general.search_date',
      // currentValue: moment().startOf('day').toDate(),
      class: 'col-sm-6 col-md-4 col-lg-3 col-xl-2',
      // reset: () => filterDef.currentValue = moment().startOf('day').toDate(),
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
