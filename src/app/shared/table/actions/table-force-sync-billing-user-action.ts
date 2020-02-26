import { ButtonColor, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { TableAction } from './table-action';

export class TableForceSyncBillingUserAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.FORCE_SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.force_synchronize_users',
    tooltip: 'general.force_synchronize',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
