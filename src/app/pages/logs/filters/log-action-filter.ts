import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilterDef } from '../../../common.types';

export class LogActionTableFilter implements TableFilter  {
  // Default filter
  private filter: TableFilterDef = {
    id: 'action',
    httpId: 'Action',
    type: Constants.FILTER_TYPE_DROPDOWN,
    name: 'logs.action',
    class: 'col-200',
    currentValue: Constants.FILTER_ALL_KEY,
    items: []
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    // translate the name
    this.filter.name = this.translateService.instant(this.filter.name);
    // Add <All>
    this.filter.items.push({ key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all') });
    // Get the Chargers
    centralServerService.getLogActions().subscribe((actions) => {
      // Create
      actions.forEach((action) => {
        // Add
        this.filter.items.push({ key: action.key, value: action.value });
      });
    });
  }

  // Return filter
  public getFilterDef(): TableFilterDef {
    return this.filter;
  }
}
