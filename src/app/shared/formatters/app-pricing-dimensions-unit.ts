import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';
import { AppCurrencyPipe } from './app-currency.pipe';

@Pipe({ name: 'appPricingDimensionsUnit' })
export class AppPricingDimensionsUnit implements PipeTransform {
  private currency: string;
  private appCurrencyPipe: AppCurrencyPipe;

  public constructor(
    private translateService: TranslateService,
    private localeService: LocaleService,
    private centralServerService: CentralServerService) {
    this.currency = this.centralServerService.getLoggedUser().currency;
    this.appCurrencyPipe = new AppCurrencyPipe(this.centralServerService, this.localeService);
  }
  public transform(i18nKey: string, price?: number): any {
    if(price){
      const formattedPrice = this.appCurrencyPipe.transform(price, this.currency);
      return this.translateService.instant(`settings.pricing.${i18nKey}`, {price: formattedPrice});
    }
    return this.translateService.instant(`settings.pricing.${i18nKey}`, {currency: this.currency});
  }
}
