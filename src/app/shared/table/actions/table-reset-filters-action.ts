import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableResetFiltersAction implements TableAction {
  private action: TableActionDef = {
    id: 'reset_filters',
    type: 'button',
    icon: 'cancel',
    name: 'general.reset_filters',
    tooltip: 'general.tooltips.reset_filters'
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
