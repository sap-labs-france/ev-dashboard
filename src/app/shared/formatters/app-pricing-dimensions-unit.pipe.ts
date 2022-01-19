import { getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'services/locale.service';

import { CentralServerService } from '../../services/central-server.service';

@Pipe({ name: 'appPricingDimensionsUnit' })
export class AppPricingDimensionsUnit implements PipeTransform {
  private currentLocaleJS: string;
  private currencyCode: string; // The [ISO 4217] currency code

  public constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService) {
    // Get the locale
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.currentLocaleJS = locale?.currentLocaleJS;
    });
    // Get the currency code
    // The currency code is part of the user token and comes from the Pricing Settings!
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      // user is null when logging out
      this.currencyCode = user?.currency;
    });
  }

  public transform(i18nKey: string): any {
    const currencySymbol = getCurrencySymbol(this.currencyCode, 'wide', this.currentLocaleJS);
    return this.translateService.instant(`settings.pricing.${i18nKey}`, { currency: currencySymbol });
  }
}
