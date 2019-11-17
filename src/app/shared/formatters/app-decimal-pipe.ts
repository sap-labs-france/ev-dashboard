import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appDecimal'})
export class AppDecimalPipe implements PipeTransform {
  private decimalPipe: DecimalPipe;

  constructor(
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.decimalPipe = new DecimalPipe(locale.currentLocaleJS);
    });
  }

  transform(value: number, digitsInfo?: string): string {
    return this.decimalPipe.transform(value, digitsInfo);
  }
}
