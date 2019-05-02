import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableDisplayChargersAction implements TableAction {
  private action: TableActionDef = {
    id: 'display_chargers',
    type: 'button',
    icon: 'ev_station',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.display_chargers'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
