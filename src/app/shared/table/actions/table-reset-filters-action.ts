import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableResetFiltersAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.RESET_FILTERS,
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
