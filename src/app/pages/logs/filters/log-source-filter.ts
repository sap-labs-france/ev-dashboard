import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';

export class LogSourceTableFilter extends ChargingStationTableFilter {
  public constructor() {
    super();
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
  }
}
