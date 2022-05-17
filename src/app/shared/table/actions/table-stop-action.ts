import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.STOP,
    type: 'button',
    icon: 'stop',
    color: ButtonActionColor.WARN,
    name: 'general.stop',
    tooltip: 'general.tooltips.stop',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
