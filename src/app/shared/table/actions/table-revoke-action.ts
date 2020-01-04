import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableRevokeAction implements TableAction {
  private action: TableActionDef = {
    id: 'revoke',
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
