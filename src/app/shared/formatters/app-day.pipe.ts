import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'appDay' })
export class AppDayPipe implements PipeTransform {
  public transform(dayNumber?: number): string {
    return moment.weekdaysShort()[dayNumber % 7];
  }
}
