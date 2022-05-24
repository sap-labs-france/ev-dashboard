import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRemoveAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REMOVE,
    type: 'button',
    icon: 'remove',
    color: ButtonActionColor.WARN,
    name: 'general.remove',
    tooltip: 'general.tooltips.remove',
    linkedToListSelection: true,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
