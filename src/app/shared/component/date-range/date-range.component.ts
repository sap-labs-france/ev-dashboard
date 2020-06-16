import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'example-simple',
  template: `
            <input
                matInput
                ngxDaterangepickerMd
                showCancel="true"
                placeholder="Choose date"
                [(ngModel)]="selected"
                [showDropdowns]="true"
                [lockStartDate]="false"
                [customRangeDirection]="false"
                (ngModelChange)="ngModelChange($event)"
                (change)="change($event)"
            />

    `,
})
export class DateRangeComponent {

  selected = {
    startDate: moment('2015-11-18T00:00Z'),
    endDate: moment('2015-11-26T00:00Z'),
  };

  ngModelChange(e): void {
    console.log(e);
  }

  change(e): void {
    console.log(e);
  }

  open(): void {
  }

  clear(e): void {
    this.selected = null;
  }
}
