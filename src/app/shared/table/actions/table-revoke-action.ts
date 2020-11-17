import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRevokeAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REVOKE,
    type: 'button',
    icon: 'link_off',
    color: ButtonColor.WARN,
    name: 'general.revoke',
    tooltip: 'general.tooltips.revoke',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
