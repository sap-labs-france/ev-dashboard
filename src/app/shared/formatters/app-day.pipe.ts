import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';

@Pipe({ name: 'appDay' })
export class AppDayPipe implements PipeTransform {

  public transform(dayNumber?: number): string {
    return dayjs.weekdaysShort()[dayNumber%7];
  }
}
