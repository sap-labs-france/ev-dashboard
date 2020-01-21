import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableInlineDeleteAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.INLINE_DELETE,
    type: 'button',
    icon: 'delete',
    color: ButtonColor.WARN,
    name: 'general.delete',
    tooltip: 'general.tooltips.delete',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
