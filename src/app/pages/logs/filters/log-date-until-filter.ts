import { DateTableFilter } from '../../../shared/table/filters/date-filter';

export class LogDateUntilTableFilter extends DateTableFilter {
  constructor(currentValue = null) {
    super();
    const filter = this.getFilterDef();
    filter.id = 'dateUntil';
    filter.httpId = 'DateUntil';
    filter.name = 'general.search_date_until';
    filter.currentValue = currentValue;
    filter.reset = () => filter.currentValue = currentValue;
  }
}
