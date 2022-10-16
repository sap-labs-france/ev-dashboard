import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableAddAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.ADD,
    type: ActionType.BUTTON,
    color: ButtonActionColor.PRIMARY,
    icon: 'add',
    name: 'general.add',
    tooltip: 'general.tooltips.add',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
