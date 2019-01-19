import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableEditChargersAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit_chargers',
    type: 'button',
    icon: 'ev_station',
    class: 'btn-info',
    name: 'general.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
