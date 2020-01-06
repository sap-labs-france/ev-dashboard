import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableEditChargersAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit_chargers',
    type: 'button',
    icon: 'ev_station',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_chargers',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
