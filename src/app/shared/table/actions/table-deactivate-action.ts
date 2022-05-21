import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableDeactivateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DEACTIVATE,
    type: 'button',
    icon: 'link_off',
    color: ButtonActionColor.PRIMARY,
    name: 'general.deactivate',
    tooltip: 'general.tooltips.deactivate',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
