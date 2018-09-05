import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../service/central-server.service';
import { TableFilterDef } from '../../../common.types';

export class LogSourceTableFilter implements TableFilter  {
  // Default filter
  private filter: TableFilterDef = {
    id: 'Source',
    type: Constants.FILTER_TYPE_DROPDOWN,
    name: 'Source',
    currentValue: Constants.FILTER_ALL_KEY,
    items: []
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    // translate the name
    this.filter.name = this.translateService.instant('logs.source');
    // Add <All>
    this.filter.items.push({ key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all') });
    // Get the Chargers
    centralServerService.getChargers({}).subscribe((chargers) => {
      // Create
      chargers.result.forEach((charger) => {
        // Add
        this.filter.items.push({ key: charger.id, value: charger.id });
      });
    });
  }

  getValue() {
    return this.filter.currentValue;
  }

  // Return filter
  getFilterDef(): TableFilterDef {
    return this.filter;
  }
}
