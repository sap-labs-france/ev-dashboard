import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableCopyAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.COPY,
    type: 'button',
    icon: 'file_copy',
    color: ButtonActionColor.PRIMARY,
    name: 'general.copy',
    tooltip: 'general.tooltips.copy',
  };

  public constructor(name?: string, tooltip?: string) {
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
