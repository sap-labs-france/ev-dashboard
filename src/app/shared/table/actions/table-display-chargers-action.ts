import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableDisplayChargersAction implements TableAction {
  private action: TableActionDef = {
    id: 'display_chargers',
    type: 'button',
    icon: 'ev_station',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.display_chargers',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
