import { TableFilter } from './table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilterDef } from '../../../common.types';
import { UsersDialogComponent } from '../../dialogs/users/users-dialog-component';

export class UserTableFilter implements TableFilter  {
  private filter: TableFilterDef = {
    id: 'user',
    httpId: 'UserID',
    type: Constants.FILTER_TYPE_DIALOG_TABLE,
    defaultValue: 'general.all',
    name: 'logs.user',
    class: 'col-200',
    dialogComponent: UsersDialogComponent
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    this.filter.defaultValue = translateService.instant(this.filter.defaultValue);
    this.filter.name = this.translateService.instant(this.filter.name);
  }

  public getFilterDef(): TableFilterDef {
    return this.filter;
  }
}
