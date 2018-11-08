import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';
import {TranslateService} from '@ngx-translate/core';

export class TableEditAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit',
    type: 'button',
    icon: 'edit',
    class: 'btn-info',
    name: this.translateService.instant('general.edit')
  }

  constructor(
    private translateService: TranslateService) {
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
