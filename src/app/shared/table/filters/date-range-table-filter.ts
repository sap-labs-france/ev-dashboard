import { TranslateService } from '@ngx-translate/core';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { Utils } from 'utils/Utils';

import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class DateRangeTableFilter extends TableFilter {
  public constructor(options: {
    translateService: TranslateService; showSeconds?: boolean; start?: Dayjs; end?: Dayjs;
    id?: string; startDateTimeHttpID?: string; endDateTimeHttpID?: string;
  }) {
    super();
    // Define filter
    const startDate = Utils.isNullOrUndefined(options.start) ? dayjs().startOf('y') : options.start;
    const endDate = Utils.isNullOrUndefined(options.end) ? dayjs().endOf('d') : options.end;
    const filterDef: TableFilterDef = {
      id: options.id ?? 'dateRange',
      httpID: '', // Not used as startDateTimeHttpID and endDateTimeHttpId are used instead
      type: FilterType.DATE_RANGE,
      name: 'general.search_date_range',
      dateRangeTableFilterDef: {
        startDateTimeHttpID: options.startDateTimeHttpID ? options.startDateTimeHttpID : 'StartDateTime',
        endDateTimeHttpID: options.endDateTimeHttpID ? options.endDateTimeHttpID : 'EndDateTime',
        timePicker: true,
        timePickerSeconds: Utils.isNullOrUndefined(options.showSeconds) ? false : options.showSeconds,
      },
      currentValue: {
        startDate,
        endDate
      },
      items: [],
      reset: () => filterDef.currentValue = { startDate, endDate }
    };
    this.setFilterDef(filterDef);
  }
}
