import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'services/locale.service';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../services/central-server.service';

@Pipe({ name: 'appPricingDimensionsUnit' })
export class AppPricingDimensionsUnit implements PipeTransform {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService
  ) {}

  public transform(i18nKey: string): any {
    const currencyCode =
      this.centralServerService.getCurrencyCode() || Constants.DEFAULT_CURRENCY_CODE;
    const currentLocaleJS = this.localeService.getLocaleInformation()?.currentLocaleJS;
    const currencySymbol = getCurrencySymbol(currencyCode, 'wide', currentLocaleJS);
    return this.translateService.instant(`settings.pricing.${i18nKey}`, {
      currency: currencySymbol,
    });
  }
}
