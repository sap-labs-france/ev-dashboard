import { CurrencyPipe, DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { PricingSettingsType } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentType, ComponentService } from 'app/services/component.service';
import { LocaleService } from 'app/services/locale.service';

@Pipe({name: 'appCurrency'})
export class AppCurrencyPipe implements PipeTransform {
  private locale: string;
  private currency: string;

  constructor(
      private currencyPipe: CurrencyPipe,
      private componentService: ComponentService,
      private localeService: LocaleService) {
    // Get the locale
    this.locale = this.localeService.getCurrentLocaleJS();
    // Get the Pricing settings
    this.componentService.getPricingSettings().subscribe((settings) => {
      // Get the currency
      if (settings && settings.type === PricingSettingsType.SIMPLE) {
        this.currency = settings.simple.currency;
      }
    });
  }

  transform(price: number, currency?: string, digitInfo: string = '1.0-2', display: string|boolean = 'symbol'): string {
    // Take from the conf
    if (!currency) {
      currency = this.currency;
    }
    return this.currencyPipe.transform(price, currency, display, digitInfo, this.locale);
  }
}
