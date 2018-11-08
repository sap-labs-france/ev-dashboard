import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';
import {TranslateService} from '@ngx-translate/core';

export class TableAddAction implements TableAction {
  private action: TableActionDef = {
    id: 'add',
    type: 'button',
    icon: 'add',
    name: this.translateService.instant('general.add')
  }

  constructor(
    private translateService: TranslateService) {
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
