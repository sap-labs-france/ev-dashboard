import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableNoAction implements TableAction {
  private action: TableActionDef = {
    id: 'block',
    type: 'button',
    icon: 'block',
    color: ButtonColor.primary,
    name: 'general.no_action',
    tooltip: 'general.tooltips.no_action'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
