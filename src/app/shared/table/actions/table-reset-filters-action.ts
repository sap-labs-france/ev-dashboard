import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableResetFiltersAction implements TableAction {
  private action: TableActionDef = {
    id: 'reset-filters',
    type: 'button',
    icon: 'cancel',
    color: ButtonColor.PRIMARY,
    name: 'general.reset_filters',
    tooltip: 'general.tooltips.reset_filters',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
