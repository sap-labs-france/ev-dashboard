import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

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
