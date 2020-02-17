import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { TableAction } from './table-action';

export class TableForceSyncBillingUserAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.force_synchronize_user',
    tooltip: 'general.force_synchronize',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
