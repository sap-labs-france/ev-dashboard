import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../services/central-server.service';

@Pipe({ name: 'appPricingDimensionsUnit' })
export class AppPricingDimensionsUnit implements PipeTransform {
  private currency: string;

  public constructor(
    private translateService: TranslateService,
    private centralServerService: CentralServerService) {
    this.currency = this.centralServerService.getLoggedUser().currency;
  }
  public transform(i18nKey: string): any {
    return this.translateService.instant(`settings.pricing.${i18nKey}`, {currency: this.currency});
  }
}
