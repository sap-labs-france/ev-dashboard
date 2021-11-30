import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appCurrency' })
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe!: CurrencyPipe;
  private currency!: string;

  public constructor(
    private centralServerService: CentralServerService,
    private localeService: LocaleService) {
    // Get the locale
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currencyPipe = new CurrencyPipe(locale.currentLocaleJS);
    });
    // Get the Pricing settings
    this.currency = this.centralServerService.getLoggedUser().currency;
  }

  public transform(price: number, currency?: string, display: string = 'symbol'): string | null {
    // Take from the conf
    if (!currency) {
      currency = this.currency;
    }
    return this.currencyPipe.transform(price, currency, display);
  }
}
