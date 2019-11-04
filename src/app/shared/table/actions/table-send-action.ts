import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableSendAction implements TableAction {
  private action: TableActionDef = {
    id: 'send',
    type: 'button',
    icon: 'cast',
    color: ButtonColor.PRIMARY,
    name: 'general.send_evses_update',
    tooltip: 'general.tooltips.send',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
