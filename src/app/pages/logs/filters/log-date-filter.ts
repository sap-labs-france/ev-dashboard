import {DateTableFilter} from '../../../shared/table/filters/date-filter';

export class LogDateTableFilter extends DateTableFilter {
  constructor() {
    super();
    const filter = this.getFilterDef();
    filter.id = 'timestamp';
    filter.httpId = 'DateFrom';
    filter.name = 'general.search_date_from';
  }
}
