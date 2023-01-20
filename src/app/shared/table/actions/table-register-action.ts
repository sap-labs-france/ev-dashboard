import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRegisterAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REGISTER,
    type: ActionType.BUTTON,
    icon: 'link',
    color: ButtonActionColor.PRIMARY,
    name: 'general.register',
    tooltip: 'general.tooltips.register',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
