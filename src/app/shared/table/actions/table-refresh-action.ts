import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: 'refresh',
    type: 'button',
    icon: 'refresh',
    color: ButtonColor.primary,
    name: '',
    tooltip: 'general.tooltips.refresh'
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
