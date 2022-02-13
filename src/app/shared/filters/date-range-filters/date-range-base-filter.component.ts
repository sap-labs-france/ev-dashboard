import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { DaterangepickerDirective } from "ngx-daterangepicker-material";

import { BaseFilterDef, DateRangeCurrentValue, DateRangeFilterDef, FilterHttpIDs } from "../../../types/Filters";
import { BaseTemplateFilter } from "../base-template-filter.component";

@Component({
  selector: 'app-date-time-range-filter',
  template: `
  <mat-form-field [class]="filter.cssClass">
    <input matInput ngxDaterangepickerMd
      [timePicker]="filter.timePicker"
      [timePickerSeconds]="filter.timePickerSeconds"
      [timePicker24Hour]="filter.timePicker24Hour"
      [locale]="filter.locale"
      [ngModel]="filter.currentValue"
      [ranges]="filter.ranges"
      [alwaysShowCalendars]="true"
      (click)="openDateRanges()"
      (ngModelChange)="filterUpdated($event)"
      (keyup.enter)="dateRangeChangedDirectly($event)"/>
    <mat-icon matSuffix class="ngx-daterangepicker-action date-range-picker-icon mt-1"
      (click)="openDateRanges()">
      date_range
    </mat-icon>
  </mat-form-field>
  `
})
export class DateRangeBaseFilterComponent extends BaseTemplateFilter{

  @Output('dataChanged') dataChanged: EventEmitter<BaseFilterDef> = new EventEmitter<BaseFilterDef>();
  @ViewChild(DaterangepickerDirective) private picker: DaterangepickerDirective;

  public filter: DateRangeFilterDef;

  public constructor(
    private translateService: TranslateService,
  ) {
    super();
    this.filter = {
      cssClass: '',
      currentValue: {
        startDate: moment(),
        endDate: moment(),
      },
      defaultValue: {
        startDate: moment(),
        endDate: moment(),
      },
      name: '',
      label: '',
      id: '',
      timePicker: true,
      timePicker24Hour: false,
      timePickerSeconds: true,
      ranges: {},
      startDateTimeHttpId: 'StartDateTime',
      endDateTimeHttpId: 'EndDateTime',
      httpId: FilterHttpIDs.ISSUER,
    }
  }

  public reset(): void {
    this.filter.currentValue = this.filter.defaultValue;
    this.filter.label = '';
  };

  public setFilter(filter: DateRangeFilterDef) {
    filter.cssClass = 'date-range-filter ' + filter.cssClass;
    Object.assign(this.filter, filter);
  }

  public filterUpdated(event: any): void {
    const currentValue = this.filter.currentValue as DateRangeCurrentValue;
    currentValue.startDate = event.startDate;
    currentValue.endDate = event.endDate;
    this.dataChanged.emit({
      id: this.filter.id,
      httpId: this.filter.httpId,
      currentValue: this.filter.currentValue
    });
    this.picker.picker.updateCalendars();
  }

  public dateRangeChangedDirectly(event: any) {
    const splitRangeValue = event.target.value.split(' - ');
    this.filterUpdated({
      startDate: moment(splitRangeValue[0], this.filter.locale.displayFormat),
      endDate: moment(splitRangeValue[1], this.filter.locale.displayFormat)
    });
  }

  public openDateRanges() {
    this.createQuickAccessDateRanges();
    this.picker.open();
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
    this.filter.ranges = dateRanges;
  }

}
