import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Options } from 'angular-datetimerangepicker';
import { Daterangepicker } from 'angular-datetimerangepicker/daterangepicker/daterangepicker.component';
import * as dayjs from 'dayjs';
import { Dayjs } from 'dayjs';

@Component({
  selector: 'app-date-time',
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
      (rangeSelected)="dateChanged($event.start)">
    </daterangepicker>
  `,
})
export class DateTimeComponent implements OnInit, OnChanges {
  @Input() public date: Date;
  @Input() public placeholder: string;
  @Input() public forceEndOfDay: boolean;
  @Input() public timePicker: boolean;
  @Input() public timePickerSeconds: boolean;
  @Input() public formControl: AbstractControl<Date>;
  @Output() public dateTimeChanged = new EventEmitter<Date>();

  @ViewChild('dateRangePicker', { static: true }) private dateRangePicker!: Daterangepicker;

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
    singleCalendar: true,
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
    private translateService: TranslateService
  ) {
    // Init
    this.timePicker = false;
  }

  public ngOnInit(): void {
    // Set Dates
    this.dateRangePickerOptions.startDate = dayjs(this.date);
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
      this.dateRangePickerOptions.format = dayjs.localeData().longDateFormat('LLL');
      this.dateRangePickerOptions.displayFormat = dayjs.localeData().longDateFormat('LLL');
    }
    if (this.placeholder) {
      this.dateRangePickerOptions.placeholder = this.translateService.instant(this.placeholder);
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
      startDate: dayjs(this.date),
    };
  }

  public showCalendar() {
    this.dateRangePicker['elem'].nativeElement.childNodes[0].childNodes[0].dispatchEvent(new Event('mousedown', { bubbles: true }));
  }

  public dateChanged(date: Dayjs) {
    console.log("🚀 -------------------------------------------------🚀");
    console.log("🚀 ~ DateTimeComponent ~ dateChanged ~ date", date);
    console.log("🚀 ~ DateTimeComponent ~ dateChanged ~ date", date.toISOString());
    console.log("🚀 -------------------------------------------------🚀");
    // Date picker
    if (date) {
      // Force start & end of day if no time picker
      if (!this.timePicker) {
        // For time to the end of day
        if (this.forceEndOfDay) {
          date = date.endOf('d');
        }
        // Override (if formControl exists, data will be updated via ngChanges)
        if (!this.formControl) {
          this.dateRangePickerOptions = {
            ...this.dateRangePickerOptions,
            startDate: dayjs(date),
          };
        }
      }
      // Update Form control
      if (this.formControl) {
        this.formControl.setValue(date.toDate());
        this.formControl.markAsDirty();
      }
      // Send Event
      this.dateTimeChanged.emit(date.toDate());
    }
  }
}
