import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'utils/Utils';

import { AppCurrencyPipe } from './app-currency.pipe';

@Pipe({ name: 'appPricingDimensionsPrice' })
export class AppPricingDimensionsPrice implements PipeTransform {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService,
    private appCurrencyPipe: AppCurrencyPipe
  ) {}

  public transform(i18nKey: string, price: number): any {
    if (!Utils.isNullOrUndefined(price)) {
      const formattedPrice = this.appCurrencyPipe.transform(price);
      return this.translateService.instant(`settings.pricing.${i18nKey}`, {
        price: formattedPrice,
      });
    }
    return '-';
  }
}
