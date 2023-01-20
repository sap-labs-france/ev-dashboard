import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as dayjs from 'dayjs';
import { DateTimeAdapter, OwlDateTimeInputDirective } from 'ng-pick-datetime';
import { DateTimeRange } from 'types/Table';
import { Utils } from 'utils/Utils';

@Component({
  selector: 'app-date-time-range',
  template: `
    <mat-form-field>
      <input matInput [min]="minDate" [max]="maxDate" [owlDateTime]="dt1"
        [ngModel]="selectedDates"
        [placeholder]="placeholder | translate" [selectMode]="'range'"
        (dateTimeChange)="dateRangeChanged($event)"
        [owlDateTimeTrigger]="dt1" readonly
      >
      <button mat-icon-button matSuffix [owlDateTimeTrigger]="dt1">
        <mat-icon>date_range</mat-icon>
      </button>
      <owl-date-time #dt1
        [pickerType]="timePicker ? 'both' : 'calendar'"
        [firstDayOfWeek]="dateRangePickerOptions.firstDayOfWeek"
        [showSecondsTimer]="timePickerSeconds"
        [hour12Timer]="dateRangePickerOptions.hour12Timer"
      >
      </owl-date-time>
    </mat-form-field>
  `,
})
export class DateTimeRangeComponent implements OnInit, OnChanges {
  @Input() public startDate: Date;
  @Input() public endDate: Date;
  @Input() public minDate: Date;
  @Input() public maxDate: Date;
  @Input() public placeholder: string;
  @Input() public timePicker: boolean;
  @Input() public timePickerSeconds: boolean;
  @Input() public allowClearDate: boolean;
  @Input() public formControl: AbstractControl<DateTimeRange>;
  @Output() public dateTimeRangeChanged = new EventEmitter<DateTimeRange>();

  public selectedDates: Date[] = [];
  public dateRangePickerOptions: { firstDayOfWeek: number; hour12Timer: boolean; placeholder: string } = {
    firstDayOfWeek: dayjs.localeData().firstDayOfWeek(),
    hour12Timer: true,
    placeholder: '',
  };

  public constructor(
    private translateService: TranslateService,
    private dateTimeAdapter: DateTimeAdapter<any>,
  ) {
    // Set locale
    this.dateTimeAdapter.setLocale(dayjs.locale());
    // Init
    this.timePicker = false;
    if (!dayjs.localeData().longDateFormat('lll').match(/A/i)) {
      this.dateRangePickerOptions.hour12Timer = false;
    }
}

  public ngOnInit(): void {
    // Set Dates
    if (this.startDate && this.endDate) {
      this.selectedDates = [
        new Date(this.startDate),
        new Date(this.endDate)
      ];
    }
    if (this.placeholder) {
      this.dateRangePickerOptions.placeholder = this.translateService.instant(this.placeholder);
    }
  }

  public ngOnChanges(): void {
    // Set Dates
    if (this.startDate && this.endDate) {
      this.selectedDates = [
        new Date(this.startDate),
        new Date(this.endDate)
      ];
    }
  }

  public dateRangeChanged(event: { source: OwlDateTimeInputDirective<Date>; value: Date[] }) {
    if (!Utils.isEmptyArray(event.value)) {
      let startDate = dayjs(event.value[0]);
      let endDate = dayjs(event.value[1]);
      // Date Range picker
      if (startDate.isValid() && endDate.isValid()) {
        // Force start & end of day if no time picker
        if (!this.timePicker) {
          startDate = startDate.startOf('d');
          endDate = endDate.endOf('d');
        }
        // Update Form control
        if (this.formControl) {
          this.formControl.setValue({
            startDate: startDate.toDate(),
            endDate: endDate.toDate(),
          });
          this.formControl.markAsDirty();
        }
        // Send Event
        this.dateTimeRangeChanged.emit({
          startDate: startDate.toDate(),
          endDate: endDate.toDate(),
        });
      // Clear the dates (Date are provided but invalid)
      } else if (this.allowClearDate) {
        // Update Form control
        if (this.formControl) {
          this.formControl.setValue({ startDate: null, endDate: null });
          this.formControl.markAsDirty();
        }
        // Send Event
        this.dateTimeRangeChanged.emit({ startDate: null, endDate: null });
      }
    }
  }
}
