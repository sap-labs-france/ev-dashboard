import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';
import {TranslateService} from '@ngx-translate/core';

export class TableCreateAction implements TableAction {
  private action: TableActionDef = {
    id: 'create',
    type: 'button',
    icon: 'add',
    name: this.translateService.instant('general.create')
  }

  constructor(
    private translateService: TranslateService) {
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
