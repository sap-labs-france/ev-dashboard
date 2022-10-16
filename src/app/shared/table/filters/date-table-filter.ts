import * as moment from 'moment';

import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class DateTableFilter extends TableFilter {
  public constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'timestamp',
      httpId: 'Date',
      type: FilterType.DATE,
      name: 'general.search_date',
      currentValue: moment().startOf('day').toDate(),
      reset: () => filterDef.currentValue = moment().startOf('day').toDate(),
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
