import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.REFRESH,
    type: 'button',
    icon: 'refresh',
    color: ButtonActionColor.PRIMARY,
    name: 'general.refresh',
    tooltip: 'general.tooltips.refresh',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
