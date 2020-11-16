import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRemoveAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REMOVE,
    type: 'button',
    icon: 'remove',
    color: ButtonColor.WARN,
    name: 'general.remove',
    tooltip: 'general.tooltips.remove',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
