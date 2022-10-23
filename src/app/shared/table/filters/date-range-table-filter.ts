import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import { Utils } from 'utils/Utils';

import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class DateRangeTableFilter extends TableFilter {
  private allRanges: any = {};
  private translateService: TranslateService;

  public constructor(options: {
    translateService: TranslateService; showSeconds?: boolean; start?: Dayjs; end?: Dayjs;
    id?: string; startDateTimeHttpId?: string; endDateTimeHttpId?: string;
  }) {
    super();
    // Define filter
    this.translateService = options.translateService;
    const startDate = Utils.isNullOrUndefined(options.start) ? dayjs().startOf('y') : options.start;
    const endDate = Utils.isNullOrUndefined(options.end) ? dayjs().endOf('d') : options.end;
    const filterDef: TableFilterDef = {
      id: options.id ? options.id : 'dateRange',
      httpId: '', //Not used as startDateTimeHttpId and endDateTimeHttpId are used instead
      type: FilterType.DATE_RANGE,
      name: 'general.search_date',
      // class: 'col-md-6 col-lg-6 col-xl-5 col-xxl-4',
      dateRangeTableFilterDef: {
        timePicker: true,
        timePicker24Hour: true,
        alwaysShowCalendars: true,
        timePickerSeconds: Utils.isNullOrUndefined(options.showSeconds) ? false : options.showSeconds,
        startDateTimeHttpId: options.startDateTimeHttpId ? options.startDateTimeHttpId : 'StartDateTime',
        endDateTimeHttpId: options.endDateTimeHttpId ? options.endDateTimeHttpId : 'EndDateTime',
        locale: {
          displayFormat: dayjs.localeData().longDateFormat('lll'),
          applyLabel: options.translateService.instant('general.apply'),
          daysOfWeek: dayjs.weekdaysMin(),
          monthNames: dayjs.monthsShort(),
          firstDay: dayjs.localeData().firstDayOfWeek(),
        },
        displayRanges: true,
        ranges: this.allRanges,
      },
      currentValue: {
        startDate,
        endDate
      },
      items: [],
      reset: () => filterDef.currentValue = { startDate, endDate }
    };
    if (dayjs.localeData().longDateFormat('lll').match(/A/i)) {
      filterDef.dateRangeTableFilterDef.timePicker24Hour = false;
    }
    if (filterDef.dateRangeTableFilterDef.displayRanges) {
      this.createQuickAccessDateRanges();
    }
    this.setFilterDef(filterDef);
  }

  private createQuickAccessDateRanges() {
    const rangeObjects: {key: string; label: string; startValue: Dayjs; endValue: Dayjs}[] = [
      { key: 'search_one_minute', label: 'logs.search_one_minute', startValue: dayjs().subtract(1, 'minute'), endValue: dayjs() },
      { key: 'search_10_minutes', label: 'logs.search_10_minutes', startValue: dayjs().subtract(10, 'minutes'), endValue: dayjs() },
      { key: 'search_30_minutes', label: 'logs.search_30_minutes', startValue: dayjs().subtract(30, 'minutes'), endValue: dayjs() },
      { key: 'search_one_hour', label: 'logs.search_one_hour', startValue: dayjs().subtract(1, 'hour'), endValue: dayjs()  },
      { key: 'search_24_hours', label: 'logs.search_24_hours', startValue: dayjs().subtract(24, 'hour'), endValue: dayjs() },
      { key: 'search_today', label: 'logs.search_today', startValue: dayjs().startOf('day'), endValue: dayjs().endOf('day')  },
      { key: 'search_yesterday', label: 'logs.search_yesterday', startValue: dayjs().subtract(1, 'day').startOf('day'), endValue: dayjs().subtract(1, 'day').endOf('day') },
      { key: 'search_this_week', label: 'logs.search_this_week', startValue: dayjs().startOf('week'), endValue: dayjs().endOf('week')  },
      { key: 'search_last_week', label: 'logs.search_last_week', startValue: dayjs().subtract(1, 'week').startOf('week'), endValue: dayjs().subtract(1, 'week').endOf('week')  },
      { key: 'search_this_month', label: 'logs.search_this_month', startValue: dayjs().startOf('month'), endValue: dayjs().endOf('month')  },
      { key: 'search_last_month', label: 'logs.search_last_month', startValue: dayjs().subtract(1, 'month').startOf('month'), endValue: dayjs().subtract(1, 'month').endOf('month') },
    ];
    for (const range of rangeObjects) {
      this.allRanges[this.translateService.instant(range.label)] = [range.startValue, range.endValue];
    }
  }
}
