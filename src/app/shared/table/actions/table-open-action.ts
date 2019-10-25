import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableOpenAction implements TableAction {
  private action: TableActionDef = {
    id: 'open',
    type: 'button',
    icon: 'open_in_new',
    color: ButtonColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
