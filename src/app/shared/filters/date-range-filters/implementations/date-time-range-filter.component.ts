import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

import { DateRangeCurrentValue, FilterHttpIDs, FilterIDs, Locale } from '../../../../types/Filters';
import { FiltersService } from '../../filters.service';
import { BaseDateRangeFilterComponent } from '../base-date-range.component';

@Component({
  selector: 'app-date-range-filter',
  templateUrl: '../base-date-range.component.html'
})
export class DateTimeRangeFilterComponent extends BaseDateRangeFilterComponent{

  public id: string;
  public label: string;
  public visible: boolean;
  public cssClass: string;
  public name: string;
  public dependentFilters?: FilterHttpIDs[];
  public startDateTimeHttpId: string;
  public endDateTimeHttpId: string;
  public currentValue: DateRangeCurrentValue;
  public defaultValue: DateRangeCurrentValue;
  public timePicker: boolean;
  public timePicker24Hour: boolean;
  public timePickerSeconds: boolean;
  public locale?: Locale;
  public ranges?: any;

  @ViewChild(DaterangepickerDirective) picker!: DaterangepickerDirective;

  constructor(
    public translateService: TranslateService,
    public filtersService: FiltersService
  ) {
    super(translateService, filtersService);
    // this.setCalendarPicker(this.picker);
    this.id = FilterIDs.DATE_RANGE;
    this.startDateTimeHttpId = FilterHttpIDs.START_DATE_TIME;
    this.endDateTimeHttpId = FilterHttpIDs.END_DATE_TIME;
    this.currentValue = {
      startDate: moment().startOf('y'),
      endDate: moment(),
    };
    this.defaultValue = {
      startDate: moment().startOf('y'),
      endDate: moment(),
    };
    this.name = '';
    this.label = '';
    this.visible = true;
    this.dependentFilters = [];
    this.timePicker = true;
    this.timePicker24Hour = false;
    this.timePickerSeconds = true;
    this.locale = {
      displayFormat: moment.localeData().longDateFormat('lll'),
      applyLabel: this.translateService.instant('general.apply'),
      daysOfWeek: moment.weekdaysMin(),
      monthNames: moment.monthsShort(),
      firstDay: moment.localeData().firstDayOfWeek()
    }
  }

}
