import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableViewAction implements TableAction {
  private action: TableActionDef = {
    id: 'view',
    type: 'button',
    icon: 'remove_red_eye',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.view'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
