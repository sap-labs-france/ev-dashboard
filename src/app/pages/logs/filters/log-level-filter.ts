import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { TableFilterDef } from '../../../common.types';

export class LogLevelTableFilter extends TableFilter  {
  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'level',
      httpId: 'Level',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'logs.level',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      currentValue: Constants.FILTER_ALL_KEY,
      items: []
    };
    // translate the name
    filterDef.name = this.translateService.instant(filterDef.name);
    // Add <All>
    filterDef.items.push({ key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all') });
    // Get the Chargers
    this.centralServerService.getLogStatus().subscribe((statuses) => {
      // Create
      statuses.forEach((status) => {
        // Add
        filterDef.items.push({ key: status.key, value: status.value });
      });
    });
    // Set
    this.setFilterDef(filterDef);
  }
}
