import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";

import { DateRangeCurrentValue, FilterHttpIDs, Locale } from "../../../types/Filters";
import { KeyValue } from "../../../types/GlobalType";
import { BaseFilter } from "../base-filter.component";
import { FiltersService } from "../filters.service";

export abstract class BaseDateRangeFilterComponent extends BaseFilter{

  public abstract startDateTimeHttpId: string;
  public abstract endDateTimeHttpId: string;
  public abstract currentValue: DateRangeCurrentValue;
  public abstract defaultValue: DateRangeCurrentValue;
  public abstract timePicker: boolean;
  public abstract timePicker24Hour: boolean;
  public abstract timePickerSeconds: boolean;
  public abstract locale?: Locale;
  public abstract ranges?: any;

  public picker: DaterangepickerDirective;

  public constructor(
    public translateService: TranslateService,
    public filtersService: FiltersService
  ) {
    super();
  }

  public createQuickAccessDateRanges(){
    const rangeObjects: {key: string; label: string; startValue: Date; endValue: Date}[] = [
      { key: 'search_one_minute', label: 'logs.search_one_minute', startValue: moment().subtract(1, 'minute').toDate(), endValue: moment().toDate() },
      { key: 'search_10_minutes', label: 'logs.search_10_minutes', startValue: moment().subtract(10, 'minutes').toDate(), endValue: moment().toDate() },
      { key: 'search_30_minutes', label: 'logs.search_30_minutes', startValue: moment().subtract(30, 'minutes').toDate(), endValue: moment().toDate() },
      { key: 'search_one_hour', label: 'logs.search_one_hour', startValue: moment().subtract(1, 'hour').toDate(), endValue: moment().toDate()  },
      { key: 'search_today', label: 'logs.search_today', startValue: moment().startOf('day').toDate(), endValue: moment().toDate()  },
      { key: 'search_yesterday', label: 'logs.search_yesterday', startValue: moment().subtract(1, 'day').startOf('day').toDate(), endValue: moment().subtract(1, 'day').endOf('day').toDate() },
      { key: 'search_this_week', label: 'logs.search_this_week', startValue: moment().startOf('week').toDate(), endValue: moment().toDate()  },
      { key: 'search_last_week', label: 'logs.search_last_week', startValue: moment().subtract(1, 'week').startOf('week').toDate(), endValue: moment().subtract(1, 'week').endOf('week').toDate()  },
      { key: 'search_this_month', label: 'logs.search_this_month', startValue: moment().startOf('month').toDate(), endValue: moment().toDate()  },
      { key: 'search_last_month', label: 'logs.search_last_month', startValue: moment().subtract(1, 'month').startOf('month').toDate(), endValue: moment().subtract(1, 'month').endOf('month').toDate() },
    ];
    const dateRanges: any = {};
    for (const range of rangeObjects) {
      dateRanges[this.translateService.instant(range.label)] = [range.startValue, range.endValue];
    }
    this.ranges = dateRanges;
  }

  public openDateRanges() {
    this.createQuickAccessDateRanges();
    this.picker.open();
  }

  public filterUpdated(event: any) {
    const currentValue = this.currentValue;
    currentValue.startDate = event.startDate;
    currentValue.endDate = event.endDate;
    this.filtersService.filterUpdated(this.getCurrentValueAsKeyValue());
    this.picker.picker.updateCalendars();
  };

  public dateRangeChangedDirectly(event: any) {
    const splitRangeValue = event.target.value.split(' - ');
    this.filterUpdated({
      startDate: moment(splitRangeValue[0], this.locale.displayFormat),
      endDate: moment(splitRangeValue[1], this.locale.displayFormat)
    });
  }

  public reset(): void {
    this.currentValue = this.defaultValue;
  }

  protected getCurrentValueAsKeyValue(): KeyValue[] {
    return [{
      key: this.startDateTimeHttpId,
      value: this.currentValue.startDate
    }, {
      key: this.endDateTimeHttpId,
      value: this.currentValue.endDate
    }]
  }

  protected setCalendarPicker(picker: DaterangepickerDirective) {
    this.picker = picker;
  }

}
