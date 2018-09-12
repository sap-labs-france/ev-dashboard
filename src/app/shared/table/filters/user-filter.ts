import { TableFilter } from './table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilterDef } from '../../../common.types';

export class UserTableFilter implements TableFilter  {
  // Default filter
  private filter: TableFilterDef = {
    id: 'user',
    httpId: 'UserID',
    type: Constants.FILTER_TYPE_DROPDOWN,
    name: 'logs.user',
    currentValue: Constants.FILTER_ALL_KEY,
    class: 'col-200',
    items: []
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    // translate the name
    this.filter.name = this.translateService.instant(this.filter.name);
    // Add <All>
    this.filter.items.push({ key: Constants.FILTER_ALL_KEY, value: translateService.instant('general.all') });
    // Get the Users
    centralServerService.getUsers({}).subscribe((users) => {
      // Create
      users.result.forEach((user) => {
        // Add
        this.filter.items.push({ key: user.id, value: `${user.name} ${user.firstName ? user.firstName : ''}` });
      });
    });
  }

  // Return filter
  getFilterDef(): TableFilterDef {
    return this.filter;
  }
}
