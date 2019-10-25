import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  private locale: string;
  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
  }

  transform(value: any): string {
    return new DatePipe(this.locale).transform(value, 'medium');
  }
}
