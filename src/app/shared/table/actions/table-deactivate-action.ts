import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableDeactivateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DEACTIVATE,
    type: 'button',
    icon: 'link_off',
    color: ButtonColor.PRIMARY,
    name: 'general.deactivate',
    tooltip: 'general.tooltips.deactivate',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
