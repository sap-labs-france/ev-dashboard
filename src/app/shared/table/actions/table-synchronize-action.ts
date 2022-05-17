import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableSynchronizeAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonActionColor.PRIMARY,
    name: 'general.synchronize',
    tooltip: 'general.tooltips.synchronize',
  };

  public constructor(id?: ButtonAction, name?: string, tooltip?: string) {
    if (id) {
      this.action.id = id;
    }
    if (name) {
      this.action.name = name;
    }
    if (tooltip) {
      this.action.tooltip = tooltip;
    }
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
