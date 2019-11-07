import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableAddAction implements TableAction {
  private action: TableActionDef = {
    id: 'add',
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
