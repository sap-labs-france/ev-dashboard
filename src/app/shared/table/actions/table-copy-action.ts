import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableCopyAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.COPY,
    type: 'button',
    icon: 'file_copy',
    color: ButtonColor.PRIMARY,
    name: 'general.copy',
    tooltip: 'general.tooltips.copy',
  };

  constructor(name?: string, tooltip?: string) {
    if (name) {
      this.action.name = name;
    }
    if (tooltip) {
      this.action.tooltip = tooltip;
    }
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
