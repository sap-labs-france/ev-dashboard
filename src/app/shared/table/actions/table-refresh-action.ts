import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REFRESH,
    type: ActionType.BUTTON,
    icon: 'refresh',
    color: ButtonActionColor.PRIMARY,
    name: 'general.refresh',
    tooltip: 'general.tooltips.refresh',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
