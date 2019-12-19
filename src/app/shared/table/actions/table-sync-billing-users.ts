import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableSyncBillingUsers implements TableAction {
  private action: TableActionDef = {
    id: 'synchronize',
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'settings.billing.synchronize_users',
    tooltip: 'general.synchronize',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
