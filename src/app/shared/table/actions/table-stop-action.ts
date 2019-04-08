import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: 'stop',
    type: 'button',
    icon: 'stop',
    color: ButtonColor.warn,
    name: 'general.stop',
    tooltip: 'general.tooltips.stop'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
