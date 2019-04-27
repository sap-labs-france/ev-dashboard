import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {

  transform(value: any, locale = 'en-US', format = 'date'): any {
    let displayFormat;
    switch (format) {
      case 'datetime':
        displayFormat = 'L LTS';
        break;
      case 'datetimeshort':
        displayFormat = 'L LT';
        break;
      case 'time':
        displayFormat = 'LTS';
        break;
      case 'date':
      default:
        displayFormat = 'L';
        break;
    }
    return moment(value).locale(locale).format(displayFormat);
  }
}
