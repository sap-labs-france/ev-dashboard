import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appDate'})
export class AppDatePipe implements PipeTransform {
  private datePipe: DatePipe;

  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.datePipe = new DatePipe(locale.currentLocaleJS);
    });
  }

  transform(value: any, format = 'medium'): string {
    return this.datePipe.transform(value);
  }
}
