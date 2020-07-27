import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';

export class LogSourceTableFilter extends ChargingStationTableFilter {
  constructor(siteIDs?: ReadonlyArray<string>) {
    super(siteIDs);
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
  }
}
