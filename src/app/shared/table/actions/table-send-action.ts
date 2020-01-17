import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableSendAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SEND,
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
