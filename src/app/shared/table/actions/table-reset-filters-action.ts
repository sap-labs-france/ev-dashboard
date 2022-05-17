import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableResetFiltersAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.RESET_FILTERS,
    type: 'button',
    icon: 'cancel',
    color: ButtonActionColor.PRIMARY,
    name: 'general.reset_filters',
    tooltip: 'general.tooltips.reset_filters',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
