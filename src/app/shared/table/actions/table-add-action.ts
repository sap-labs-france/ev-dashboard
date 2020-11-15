import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableAddAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.ADD,
    type: 'button',
    color: ButtonColor.PRIMARY,
    icon: 'add',
    name: 'general.add',
    tooltip: 'general.tooltips.add',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
