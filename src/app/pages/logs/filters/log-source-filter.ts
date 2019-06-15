import { ChargerTableFilter } from '../../../shared/table/filters/charger-filter';

export class LogSourceTableFilter extends ChargerTableFilter {
  constructor() {
    super();
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
  }
}
