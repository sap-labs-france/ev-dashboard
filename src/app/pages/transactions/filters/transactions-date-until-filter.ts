import {TranslateService} from '@ngx-translate/core';
import {DateTableFilter} from '../../../shared/table/filters/date-filter';

export class TransactionsDateUntilFilter extends DateTableFilter {
  constructor(
    protected translateService: TranslateService) {
    super(translateService);
    const filter = this.getFilterDef();
    filter.id = 'dateUntil';
    filter.httpId = 'EndDateTime';
    filter.name = 'general.search_date_until';
    filter.currentValue = null;
  }
}
