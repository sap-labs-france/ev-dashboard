import {TableFilter} from '../../../shared/table/filters/table-filter';
import {Constants} from '../../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';
import {CentralServerService} from '../../../services/central-server.service';
import {TableFilterDef} from '../../../common.types';

export class LogActionTableFilter extends TableFilter {
  constructor(
    private translateService: TranslateService,
    private centralServerService: CentralServerService) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'action',
      httpId: 'Action',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'logs.action',
      class: 'col-md-6 col-lg-4 col-xl-2',
      currentValue: Constants.FILTER_ALL_KEY,
      items: []
    };
    // translate the name
    filterDef.name = this.translateService.instant(filterDef.name);
    // Add <All>
    filterDef.items.push({key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all')});
    // Get the Chargers
    this.centralServerService.getLogActions().subscribe((actions) => {
      // Create
      actions.forEach((action) => {
        // Add
        filterDef.items.push({key: action.key, value: action.value});
      });
    });
    // Set
    this.setFilterDef(filterDef);
  }
}
