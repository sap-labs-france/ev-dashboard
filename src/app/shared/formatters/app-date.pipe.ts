import {Pipe, PipeTransform} from '@angular/core';
import {LocaleService} from '../../services/locale.service';
import {formatDate} from '@angular/common';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  private locale: string;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
  }

  transform(value: any): any {
    return formatDate(value, 'shortDate', this.locale);
  }
}
