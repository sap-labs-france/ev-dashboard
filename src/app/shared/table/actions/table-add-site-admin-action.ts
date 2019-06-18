import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableAddSiteAdminAction implements TableAction {
  private action: TableActionDef = {
    id: 'add-site-admin',
    type: 'button',
    color: ButtonColor.primary,
    name: 'sites.assign_admin_role',
    tooltip: 'sites.assign_admin_role'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
