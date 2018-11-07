import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';
import {TranslateService} from '@ngx-translate/core';

export class TableUpdateAction implements TableAction {
  private action: TableActionDef = {
    id: 'update',
    type: 'button',
    icon: 'edit',
    class: 'btn-warning',
    name: this.translateService.instant('general.update')
  }

  constructor(
    private translateService: TranslateService) {
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
