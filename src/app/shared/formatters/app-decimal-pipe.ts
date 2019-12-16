import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService, Locale } from 'app/services/locale.service';

@Pipe({name: 'appDecimal'})
export class AppDecimalPipe implements PipeTransform {
  private decimalPipe!: DecimalPipe;

  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale: Locale) => {
      this.decimalPipe = new DecimalPipe(locale.currentLocaleJS);
    });
  }

  transform(value: number, digitsInfo?: string): string | null {
    return this.decimalPipe.transform(value, digitsInfo);
  }
}
