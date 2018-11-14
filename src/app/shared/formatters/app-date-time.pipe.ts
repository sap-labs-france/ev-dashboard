import {Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../../services/locale.service';

@Pipe({name: 'appDateTime'})
export class AppDateTimePipe implements PipeTransform {
  private locale: string;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
  }

  transform(value: any): any {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.locale, {
      hour12: false,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    }).format(date);
  }
}
