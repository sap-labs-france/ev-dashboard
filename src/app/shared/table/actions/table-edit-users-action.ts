import { ButtonColor, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { TableAction } from './table-action';

export class TableEditUsersAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.EDIT_USERS,
    type: 'button',
    icon: 'people',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_users',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
