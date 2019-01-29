import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableSendAction implements TableAction {
  private action: TableActionDef = {
    id: 'send',
    type: 'button',
    icon: 'cast',
    class: 'btn-info',
    name: 'general.send_evses_update',
    tooltip: 'general.tooltips.send'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
