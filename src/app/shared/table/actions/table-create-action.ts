import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableCreateAction implements TableAction {
  private action: TableActionDef = {
    id: 'create',
    type: 'button',
    icon: 'add',
    color: ButtonColor.primary,
    name: 'general.create',
    tooltip: 'general.tooltips.create'
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
