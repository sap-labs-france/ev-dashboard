import { ButtonColor, TableActionDef } from '../../../types/Table';

import { ButtonAction } from '../../../types/GlobalType';
import { TableAction } from './table-action';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REFRESH,
    type: 'button',
    icon: 'refresh',
    color: ButtonColor.PRIMARY,
    name: 'general.refresh',
    tooltip: 'general.tooltips.refresh',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
