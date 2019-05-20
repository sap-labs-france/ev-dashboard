import {Pipe, PipeTransform} from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { LocaleService } from 'app/services/locale.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ComponentEnum } from 'app/services/component.service';

@Pipe({name: 'appCurrency'})
export class AppCurrencyPipe implements PipeTransform {
  private locale: string;
  private currency: string;

  constructor(
      private currencyPipe: CurrencyPipe,
      private centralServerService: CentralServerService,
      private localeService: LocaleService) {
    // Get the locale
    this.locale = this.localeService.getCurrentFullLocaleForJS();
    // Get the Pricing settings
    this.centralServerService.getSettings(ComponentEnum.PRICING).subscribe((setting) => {
      // Get the currency
      if (setting && setting.count > 0 && setting.result[0].content) {
        const config = setting.result[0].content;
        if (config.simple) {
          this.currency = config.simple.currency ? config.simple.currency : '';
        }
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
