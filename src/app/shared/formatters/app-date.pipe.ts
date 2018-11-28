import {Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../../services/locale.service';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  constructor(private localeService: LocaleService) {
  }

  transform(value: any, ...args: any[]): any {
    const format = args && args[0] ? args[0] : '';
    let options;
    switch (format) {
      case 'datetime':
        options = {
          hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        break;
      case 'time':
        options = {
          hour12: false,
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        break;
      case 'date':
      default:
        options = {
          hour12: false,
          year: 'numeric', month: '2-digit', day: '2-digit'
        };
        break;
    }
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.localeService.getCurrentFullLocaleForJS(), options).format(date);
  }
}
