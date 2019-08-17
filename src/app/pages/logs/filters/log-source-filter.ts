import { AuthorizationService } from '../../../services/authorization.service';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';

export class LogSourceTableFilter extends ChargerTableFilter {
  constructor(private authorizationService: AuthorizationService) {
    super();
    // Get the filter
    const filter = this.getFilterDef();
    // Change Http ID
    filter.httpId = 'Source';
    if (this.authorizationService.hasSitesAdminRights()) {
      filter.dialogComponentData = {
        staticFilter: {
          SiteID: this.authorizationService.getSitesAdmin().join('|')
        }
      };
    }
  }
}
