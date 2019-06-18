import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableRemoveSiteAdminAction implements TableAction {
  private action: TableActionDef = {
    id: 'remove-site-admin',
    type: 'button',
    color: ButtonColor.primary,
    name: 'sites.unassign_admin_role',
    tooltip: 'sites.unassign_admin_role'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
