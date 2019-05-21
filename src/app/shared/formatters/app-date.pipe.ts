import {Pipe, PipeTransform} from '@angular/core';
import { DatePipe } from '@angular/common';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  private locale: string;
  constructor(
    private localeService: LocaleService) {
      this.locale = this.localeService.getCurrentFullLocaleForJS();
  }

  transform(value: any): string {
    return new DatePipe(this.locale).transform(value, 'medium');
  }
}
