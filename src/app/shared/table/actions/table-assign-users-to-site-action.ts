import { ButtonColor, TableActionDef } from 'app/types/Table';

import { TableAction } from './table-action';
import { UserButtonAction } from 'app/types/User';

export class TableAssignUsersToSiteAction implements TableAction {
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
