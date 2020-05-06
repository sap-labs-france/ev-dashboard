import { DateTableFilter } from '../../../shared/table/filters/date-table-filter';

export class InvoicesDateFromFilter extends DateTableFilter {
  constructor(currentValue = null) {
    super();
    const filter = this.getFilterDef();
    filter.id = 'dateFrom';
    filter.httpId = 'StartDateTime';
    filter.name = 'general.search_date_from';
    filter.currentValue = currentValue;
    filter.reset = () => filter.currentValue = currentValue;

  }
}
