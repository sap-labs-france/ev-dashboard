import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'dateTimePipe'})
export class DateTimePipe implements PipeTransform {
  private locale;

  constructor(locale: string) {
    this.locale = locale;
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
