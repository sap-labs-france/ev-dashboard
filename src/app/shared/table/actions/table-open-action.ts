import { ButtonAction } from '../../../types/GlobalType';
import { ButtonActionColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableOpenAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OPEN,
    type: 'button',
    icon: 'open_in_new',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
