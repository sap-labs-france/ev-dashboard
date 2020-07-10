import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';

import { TableAction } from './table-action';

export class TableSynchronizeAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: '',
    tooltip: 'general.synchronize',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
