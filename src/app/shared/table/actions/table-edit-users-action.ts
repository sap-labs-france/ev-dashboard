import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableEditUsersAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit_users',
    type: 'button',
    icon: 'people',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_users',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
