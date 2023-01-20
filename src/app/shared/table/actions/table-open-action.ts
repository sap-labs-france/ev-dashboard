import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableOpenAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OPEN,
    type: ActionType.BUTTON,
    icon: 'open_in_new',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
