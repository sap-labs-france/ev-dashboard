import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableRemoveAction implements TableAction {
  private action: TableActionDef = {
    id: 'remove',
    type: 'button',
    icon: 'remove',
    color: ButtonColor.warn,
    name: 'general.remove',
    tooltip: 'general.tooltips.remove'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
