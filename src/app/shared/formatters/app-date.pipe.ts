import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  private datePipe!: DatePipe;

  public constructor(private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.datePipe = new DatePipe(locale.currentLocaleJS);
    });
  }

  public transform(value: Date, format = 'short'): string | null {
    return this.datePipe.transform(value, format);
  }
}
