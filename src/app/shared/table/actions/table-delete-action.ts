import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableDeleteAction implements TableAction {
  private action: TableActionDef = {
    id: 'delete',
    type: 'button',
    icon: 'delete',
    color: ButtonColor.warn,
    name: 'general.remove',
    tooltip: 'general.tooltips.delete'
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
