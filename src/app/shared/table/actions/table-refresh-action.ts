import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REFRESH,
    type: 'button',
    icon: 'refresh',
    color: ButtonColor.PRIMARY,
    name: '',
    tooltip: 'general.tooltips.refresh',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
