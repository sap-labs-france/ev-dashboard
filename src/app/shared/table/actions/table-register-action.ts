import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableRegisterAction implements TableAction {
  private action: TableActionDef = {
    id: 'register',
    type: 'button',
    icon: 'swap_horiz',
    color: ButtonColor.primary,
    name: 'general.register',
    tooltip: 'general.tooltips.register'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
