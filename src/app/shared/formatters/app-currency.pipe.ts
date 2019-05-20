import {Pipe, PipeTransform} from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LocaleService } from 'app/services/locale.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentEnum, ComponentService } from 'app/services/component.service';
import { PricingSettingsType } from 'app/common.types';

@Pipe({name: 'appCurrency'})
export class AppCurrencyPipe implements PipeTransform {
  private locale: string;
  private currency: string;

  constructor(
      private currencyPipe: CurrencyPipe,
      private componentService: ComponentService,
      private localeService: LocaleService) {
    // Get the locale
    this.locale = this.localeService.getCurrentFullLocaleForJS();
    // Get the Pricing settings
    this.componentService.getPricingSettings().subscribe((settings) => {
      // Get the currency
      if (settings && settings.type === PricingSettingsType.simple) {
        this.currency = settings.simplePricing.currency;
      }
    });
  }

  transform(price: number, currency?: string, digitInfo: string = '1.0-2', display: string|boolean = 'symbol'): string {
    if (!currency) {
      // Take from the conf
      currency = this.currency;
    }
    return this.currencyPipe.transform(price, currency, display, digitInfo, this.locale);
  }
}
