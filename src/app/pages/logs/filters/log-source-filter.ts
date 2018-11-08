import {TranslateService} from '@ngx-translate/core';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';

export class LogSourceTableFilter extends ChargerTableFilter {
  constructor(
    protected translateService: TranslateService) {
    super(translateService);
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
  }
}
