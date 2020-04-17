import { AuthorizationService } from '../../../services/authorization.service';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';

export class LogSourceTableFilter extends ChargerTableFilter {
  constructor(siteIDs?: ReadonlyArray<string>) {
    super(siteIDs);
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
  }
}
