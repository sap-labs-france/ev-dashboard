import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableEditAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit',
    type: 'button',
    icon: 'edit',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
