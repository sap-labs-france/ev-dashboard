import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../service/central-server.service';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { TableFilterDef } from '../../../common.types';

export class LogStatusTableFilter implements TableFilter  {
  // Default filter
  private filter: TableFilterDef = {
    id: 'Level',
    type: Constants.FILTER_TYPE_DROPDOWN,
    name: 'Level',
    currentValue: Constants.FILTER_ALL_KEY,
    items: []
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    // translate the name
    this.filter.name = this.translateService.instant('logs.level');
    // Add <All>
    this.filter.items.push({ key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all') });
    // Get the Chargers
    centralServerService.getLogStatus().subscribe((statuses) => {
      // Create
      statuses.forEach((status) => {
        // Add
        this.filter.items.push({ key: status.key, value: status.description });
      });
    });
  }

  // Return filter
  getFilterDef(): TableFilterDef {
    return this.filter;
  }

  getValue() {
    return this.filter.currentValue;
  }
}
