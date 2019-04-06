import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableAddAction implements TableAction {
  private action: TableActionDef = {
    id: 'add',
    type: 'button',
    color: ButtonColor.primary,
    icon: 'add',
    name: 'general.add',
    tooltip: 'general.tooltips.add'
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
