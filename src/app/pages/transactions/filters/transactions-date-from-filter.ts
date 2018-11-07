import {TranslateService} from '@ngx-translate/core';
import {DateTableFilter} from '../../../shared/table/filters/date-filter';

export class TransactionsDateFromFilter extends DateTableFilter {
  constructor(
    protected translateService: TranslateService) {
    super(translateService);
    const filter = this.getFilterDef();
    filter.id = 'dateFrom';
    filter.httpId = 'StartDateTime';
    filter.name = 'general.search_date_from';
  }
}
