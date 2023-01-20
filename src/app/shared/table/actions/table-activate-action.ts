import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableActivateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.ACTIVATE,
    type: ActionType.BUTTON,
    icon: 'link',
    color: ButtonActionColor.PRIMARY,
    name: 'general.activate',
    tooltip: 'general.tooltips.activate',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
