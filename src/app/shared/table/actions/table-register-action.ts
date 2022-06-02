import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRegisterAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REGISTER,
    type: 'button',
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
