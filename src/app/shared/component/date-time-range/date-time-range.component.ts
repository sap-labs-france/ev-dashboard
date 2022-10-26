import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DateRange, DefinedDateRange, Options } from 'angular-datetimerangepicker';
import { Daterangepicker } from 'angular-datetimerangepicker/daterangepicker/daterangepicker.component';
import * as dayjs from 'dayjs';
import { DateTimeRange } from 'types/Table';

@Component({
  selector: 'app-date-time-range',
  template: `
    <mat-form-field>
      <input matInput readonly (click)="showCalendar()"
        [placeholder]="placeholder | translate"
        [value]="dateRangePicker['elem'].nativeElement.childNodes[0].childNodes[0].value"
      >
      <button mat-icon-button matSuffix (click)="showCalendar()">
        <mat-icon>date_range</mat-icon>
      </button>
    </mat-form-field>
    <daterangepicker
      #dateRangePicker
      class="form-control"
      [options]="dateRangePickerOptions"
      (rangeSelected)="dateRangeChanged($event)">
    </daterangepicker>
  `,
})
export class DateTimeRangeComponent implements OnInit, OnChanges {
  @Input() public startDate: Date;
  @Input() public endDate: Date;
  @Input() public placeholder: string;
  @Input() public timePicker: boolean;
  @Input() public timePickerSeconds: boolean;
  @Input() public displayRanges: boolean;
  @Input() public formControl: AbstractControl<DateTimeRange>;
  @Output() public dateTimeRangeChanged = new EventEmitter<DateTimeRange>();

  @ViewChild('dateRangePicker', { static: true }) private dateRangePicker!: Daterangepicker;

  public ranges: DefinedDateRange[] = [
    { name: 'logs.search_one_minute', value: { start: dayjs().subtract(1, 'm'), end: dayjs() } },
    { name: 'logs.search_10_minutes', value: { start: dayjs().subtract(10, 'm'), end: dayjs() } },
    { name: 'logs.search_30_minutes', value: { start: dayjs().subtract(30, 'm'), end: dayjs() } },
    { name: 'logs.search_one_hour', value: { start: dayjs().subtract(1, 'h'), end: dayjs()  } },
    { name: 'logs.search_24_hours', value: { start: dayjs().subtract(24, 'h'), end: dayjs() } },
    { name: 'logs.search_today', value: { start: dayjs().startOf('d'), end: dayjs().endOf('d')  } },
    { name: 'logs.search_yesterday', value: { start: dayjs().subtract(1, 'd').startOf('d'), end: dayjs().subtract(1, 'd').endOf('d') } },
    { name: 'logs.search_this_week', value: { start: dayjs().startOf('w'), end: dayjs().endOf('w')  } },
    { name: 'logs.search_last_week', value: { start: dayjs().subtract(1, 'w').startOf('w'), end: dayjs().subtract(1, 'w').endOf('w')  } },
    { name: 'logs.search_this_month', value: { start: dayjs().startOf('M'), end: dayjs().endOf('M')  } },
    { name: 'logs.search_last_month', value: { start: dayjs().subtract(1, 'M').startOf('M'), end: dayjs().subtract(1, 'M').endOf('M') } },
  ];

  public dateRangePickerOptions: Options = {
    minDate: dayjs().add(-120, 'months'),
    maxDate: dayjs().add(120, 'months'),
    format: dayjs.localeData().longDateFormat('LL'),
    displayFormat: dayjs.localeData().longDateFormat('LL'),
    inactiveBeforeStart: false,
    disableBeforeStart: true,
    autoApply: true,
    theme: 'light',
    required: false,
    showRanges: false,
    noDefaultRangeSelected: false,
    singleCalendar: false,
    position: 'left',
    disabled: false,
    readOnly: true,
    disableWeekEnds: false,
    disabledDays: [],
    disabledDates: [],
    alwaysOpen: false,
    weekStartsOn: dayjs.localeData().firstDayOfWeek(),
  };

  public constructor(
    private translateService: TranslateService,
  ) {
    // Init
    this.timePicker = false;
    this.displayRanges = false;
    // Translate ranges
    for (const range of this.ranges) {
      range.name = this.translateService.instant(range.name);
    }
  }

  public ngOnInit(): void {
    // Set Dates
    this.dateRangePickerOptions.startDate = dayjs(this.startDate);
    this.dateRangePickerOptions.endDate = dayjs(this.endDate);
    // Check Time
    if (this.timePicker) {
      this.dateRangePickerOptions.timePicker = {
        minuteInterval: 1,
        twentyFourHourFormat: false
      };
      if (!dayjs.localeData().longDateFormat('lll').match(/A/i)) {
        this.dateRangePickerOptions.timePicker.twentyFourHourFormat = true;
      }
      // Display time
      this.dateRangePickerOptions.format = dayjs.localeData().longDateFormat('lll');
      this.dateRangePickerOptions.displayFormat = dayjs.localeData().longDateFormat('lll');
    }
    if (this.placeholder) {
      this.dateRangePickerOptions.placeholder = this.translateService.instant(this.placeholder);
    }
    if (this.displayRanges) {
      this.dateRangePickerOptions.showRanges = this.displayRanges;
      this.dateRangePickerOptions.preDefinedRanges = this.ranges;
    }
    // Recreate the object (mandatory to refresh the component when date or format are changed)
    this.dateRangePickerOptions = {
      ...this.dateRangePickerOptions,
    };
  }

  public ngOnChanges(): void {
    // Set Dates (mandatory to force recreate the object)
    this.dateRangePickerOptions = {
      ...this.dateRangePickerOptions,
      startDate: dayjs(this.startDate),
      endDate: dayjs(this.endDate),
    };
  }

  public showCalendar() {
    this.dateRangePicker['elem'].nativeElement.childNodes[0].childNodes[0].dispatchEvent(new Event('mousedown', { bubbles: true }));
  }

  public dateRangeChanged(dateRange: DateRange) {
    // Date Range picker
    if (dateRange?.start && dateRange?.end) {
      // Force start & end of day if no time picker
      if (!this.timePicker) {
        dateRange.start = dateRange.start.startOf('d');
        dateRange.end = dateRange.end.endOf('d');
        // Override (if formControl exists, data will be updated via ngChanges)
        if (!this.formControl) {
          this.dateRangePickerOptions = {
            ...this.dateRangePickerOptions,
            startDate: dateRange.start,
            endDate: dateRange.end,
          };
        }
      }
      // Update Form control
      if (this.formControl) {
        this.formControl.setValue({
          startDate: dateRange.start.toDate(),
          endDate: dateRange.end.toDate(),
        });
        this.formControl.markAsDirty();
      }
      // Send Event
      this.dateTimeRangeChanged.emit({
        startDate: dateRange.start.toDate(),
        endDate: dateRange.end.toDate(),
      });
    }
  }
}
