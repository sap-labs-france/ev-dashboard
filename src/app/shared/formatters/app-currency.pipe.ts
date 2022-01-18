import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appCurrency' })
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe!: CurrencyPipe;
  private currencyCode!: string; // The [ISO 4217] currency code
  public constructor(
    private centralServerService: CentralServerService,
    private localeService: LocaleService) {
    // Get the locale
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currencyPipe = new CurrencyPipe(locale.currentLocaleJS);
    });
    // Get the currency code
    // The currency code is part of the user token and comes from the Pricing Settings!
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      // user is null when logging out
      this.currencyCode = user?.currency;
    });
  }

  public transform(price: number, currencyCode?: string, display: string = 'symbol'): string | null {
    if (!currencyCode) {
      currencyCode = this.currencyCode;
    }
    return this.currencyPipe.transform(price, currencyCode, display);
  }
}
