import { DateTableFilter } from '../../../shared/table/filters/date-table-filter';

export class EndDateFilter extends DateTableFilter {
  public constructor(currentValue = null) {
    super();
    const filter = this.getFilterDef();
    filter.id = 'dateUntil';
    filter.httpId = 'EndDateTime';
    filter.name = 'general.search_date_until';
    filter.currentValue = currentValue;
    filter.reset = () => (filter.currentValue = currentValue);
  }
}
