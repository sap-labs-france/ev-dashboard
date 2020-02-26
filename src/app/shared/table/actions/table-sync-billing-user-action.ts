import { ButtonColor, TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { TableAction } from './table-action';

export class TableSyncBillingUserAction implements TableAction {
  private action: TableActionDef = {
    id: UserButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.synchronize_user',
    tooltip: 'general.synchronize',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
