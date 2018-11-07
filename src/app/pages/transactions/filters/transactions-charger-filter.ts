import {TranslateService} from '@ngx-translate/core';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';

export class TransactionsChargerFilter extends ChargerTableFilter {
  constructor(
    protected translateService: TranslateService) {
    super(translateService);
    const filter = this.getFilterDef();
    filter.httpId = 'ChargeBoxID';
  }
}
