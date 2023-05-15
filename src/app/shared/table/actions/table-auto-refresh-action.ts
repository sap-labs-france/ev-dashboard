import { ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableAutoRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.AUTO_REFRESH,
    type: 'slide',
    currentValue: true,
    name: 'general.auto_refresh',
    tooltip: 'general.tooltips.auto_refresh',
  };

  public constructor(private defaultValue: boolean = false) {
    // Set
    this.action.currentValue = defaultValue;
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
