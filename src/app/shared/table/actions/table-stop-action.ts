import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: 'stop',
    type: 'button',
    icon: 'stop',
    class: 'btn-danger action-icon-large',
    name: 'general.stop',
    tooltip: 'general.tooltips.stop'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
