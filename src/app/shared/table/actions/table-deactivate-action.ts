import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableDeactivateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DEACTIVATE,
    type: ActionType.BUTTON,
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
