import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableRevokeAction implements TableAction {
  private action: TableActionDef = {
    id: 'revoke',
    type: 'button',
    icon: 'link_off',
    color: ButtonColor.warn,
    name: 'general.revoke',
    tooltip: 'general.tooltips.revoke',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
