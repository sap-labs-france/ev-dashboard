import { Locale, LocaleService } from '../../services/locale.service';
import { Pipe, PipeTransform } from '@angular/core';

import { DecimalPipe } from '@angular/common';

@Pipe({ name: 'appDecimal' })
export class AppDecimalPipe implements PipeTransform {
  private decimalPipe!: DecimalPipe;

  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale: Locale) => {
      this.decimalPipe = new DecimalPipe(locale.currentLocaleJS);
    });
  }

  public transform(value: number, digitsInfo?: string): string | null {
    return this.decimalPipe.transform(value, digitsInfo);
  }
}
