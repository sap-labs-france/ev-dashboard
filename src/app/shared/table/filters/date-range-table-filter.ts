import * as moment from 'moment';

import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class DateRangeTableFilter extends TableFilter {
  constructor(language?: string) {
    moment.locale(language);
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'dateRange',
      httpId: 'DateRange',
      type: FilterType.DATE_RANGE,
      name: 'general.search_date',
      class: 'col-sm-6 col-md-4 col-lg-3 col-md-3',
      dateRangeTableFilterDef: {
        timePicker: true,
        timePickerSeconds: false
      },
      currentValue: {
        startDate: moment(),
        endDate: moment().add(1, 'years')
      },
    };
    // Set
    this.setFilterDef(filterDef);
    if (language) {
      filterDef.dateRangeTableFilterDef.timePicker24Hour = !(new Date().toLocaleString(language).match(/am|pm/i));
    } else {
      filterDef.dateRangeTableFilterDef.timePicker24Hour = true;
    }
  }
}
