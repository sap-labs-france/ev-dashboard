import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { BaseFilterDef, FilterHttpIDs, FilterIDs } from '../../../../types/Filters';
import { BaseFilter } from '../../base-filter.component';
import { FiltersService } from '../../filters.service';
import { DateRangeBaseFilterComponent } from '../date-range-base-filter.component';

@Component({
  selector: 'app-date-range-filter',
  template: '<app-date-time-range-filter (dataChanged)="updateService($event)"></app-date-time-range-filter>'
})
export class DateTimeRangeFilterComponent extends BaseFilter implements AfterViewInit{

  @ViewChild(DateRangeBaseFilterComponent) dateRangeFilter!: DateRangeBaseFilterComponent;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private translateService: TranslateService,
    private filtersService: FiltersService,
  ) {
    super();
    this.baseDetails = {
      id: FilterIDs.DATE_RANGE,
      httpId: FilterHttpIDs.ALTERNATE,
      currentValue: {
        startDate: moment().startOf('y'),
        endDate: moment(),
      },
      startDateTimeHttpId: FilterHttpIDs.START_DATE_TIME,
      endDateTimeHttpId: FilterHttpIDs.END_DATE_TIME,
    }
    this.filtersService.setFilterValue(this.baseDetails);
  }

  public updateService(newData: BaseFilterDef){
    this.filtersService.setFilterValue(newData);
  }

  private initFilter() {
    this.dateRangeFilter.setFilter({
      ...this.baseDetails,
      name: 'cars.car_makers',
      label: '',
      cssClass: '',
      defaultValue: {
        startDate: moment().startOf('y'),
        endDate: moment(),
      },
      timePicker: true,
      timePicker24Hour: false,
      timePickerSeconds: true,
      locale: {
        displayFormat: moment.localeData().longDateFormat('lll'),
        applyLabel: this.translateService.instant('general.apply'),
        daysOfWeek: moment.weekdaysMin(),
        monthNames: moment.monthsShort(),
        firstDay: moment.localeData().firstDayOfWeek()
      }
    })
  }

  ngAfterViewInit(): void {
    this.initFilter();
    this.changeDetectorRef.detectChanges();
  }

}
