import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { ComponentService } from '../../services/component.service';
import { LocaleService } from '../../services/locale.service';
import { PricingSettingsType } from '../../types/Setting';

@Pipe({ name: 'appCurrency' })
export class AppCurrencyPipe implements PipeTransform {
  private currencyPipe!: CurrencyPipe;
  private currency!: string;

  constructor(
    private componentService: ComponentService,
    private localeService: LocaleService) {
    // Get the locale
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currencyPipe = new CurrencyPipe(locale.currentLocaleJS);
    });
    // Get the Pricing settings
    this.componentService.getPricingSettings().subscribe((settings) => {
      // Get the currency
      if (settings && settings.type === PricingSettingsType.SIMPLE) {
        this.currency = settings.simple.currency;
      }
    });
  }

  public transform(price: number, currency?: string, display: string = 'symbol'): string | null {
    // Take from the conf
    if (!currency) {
      currency = this.currency;
    }
    return this.currencyPipe.transform(price, currency, display);
  }
}
