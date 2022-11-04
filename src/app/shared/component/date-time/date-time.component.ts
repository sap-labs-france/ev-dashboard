import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as dayjs from 'dayjs';
import { DateTimeAdapter, OwlDateTimeInputDirective } from 'ng-pick-datetime';

@Component({
  selector: 'app-date-time',
  template: `
    <mat-form-field>
      <input matInput [min]="minDate" [max]="maxDate" [owlDateTime]="dt1"
        [ngModel]="selectedDate"
        [placeholder]="placeholder | translate" [selectMode]="'single'"
        (dateTimeChange)="dateChanged($event)"
        [owlDateTimeTrigger]="dt1" readonly
      >
      <button mat-icon-button matSuffix [owlDateTimeTrigger]="dt1">
        <mat-icon>date_range</mat-icon>
      </button>
      <owl-date-time #dt1
        [pickerType]="timePicker ? 'both' : 'calendar'"
        [firstDayOfWeek]="datePickerOptions.firstDayOfWeek"
        [showSecondsTimer]="timePickerSeconds"
        [hour12Timer]="datePickerOptions.hour12Timer"
      >
      </owl-date-time>
    </mat-form-field>
  `,
})
export class DateTimeComponent implements OnInit, OnChanges {
  @Input() public date: Date;
  @Input() public minDate: Date;
  @Input() public maxDate: Date;
  @Input() public placeholder: string;
  @Input() public forceEndOfDay: boolean;
  @Input() public timePicker: boolean;
  @Input() public timePickerSeconds: boolean;
  @Input() public allowClearDate: boolean;
  @Input() public formControl: AbstractControl<Date>;
  @Output() public dateTimeChanged = new EventEmitter<Date>();

  public selectedDate: Date;
  public datePickerOptions: { firstDayOfWeek: number; hour12Timer: boolean; placeholder: string } = {
    firstDayOfWeek: dayjs.localeData().firstDayOfWeek(),
    hour12Timer: true,
    placeholder: ''
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
      this.datePickerOptions.hour12Timer = false;
    }
}

  public ngOnInit(): void {
    // Set Dates
    if (this.date) {
      this.selectedDate = new Date(this.date);
    }
    if (this.placeholder) {
      this.datePickerOptions.placeholder = this.translateService.instant(this.placeholder);
    }
  }

  public ngOnChanges(): void {
    // Set Date
    if (this.date) {
      this.selectedDate = new Date(this.date);
    }
  }

  public dateChanged(event: { source: OwlDateTimeInputDirective<Date>; value: Date }) {
    if (event.value) {
      let date = dayjs(event.value);
      // Date picker
      if (date.isValid()) {
        // Force start & end of day if no time picker
        if (!this.timePicker) {
          // For time to the end of day
          if (this.forceEndOfDay) {
            date = date.endOf('d');
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
    // Clear the date
    } else if (this.allowClearDate) {
      // Update Form control
      if (this.formControl) {
        this.formControl.setValue(null);
        this.formControl.markAsDirty();
      }
      // Send Event
      this.dateTimeChanged.emit(null);
    }
  }
}
