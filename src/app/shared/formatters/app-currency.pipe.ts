import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CentralServerService } from 'services/central-server.service';
import { Constants } from 'utils/Constants';

import { LocaleService } from '../../services/locale.service';

@Pipe({ name: 'appCurrency' })
export class AppCurrencyPipe implements PipeTransform {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private localeService: LocaleService
  ) {}

  public transform(price: number, currencyCode?: string, display = 'symbol'): string | null {
    currencyCode =
      currencyCode ||
      this.centralServerService.getCurrencyCode() ||
      Constants.DEFAULT_CURRENCY_CODE;
    const currentLocaleJS = this.localeService.getLocaleInformation()?.currentLocaleJS;
    const currencyPipe = new CurrencyPipe(currentLocaleJS);
    return currencyPipe.transform(price, currencyCode, display);
  }
}
