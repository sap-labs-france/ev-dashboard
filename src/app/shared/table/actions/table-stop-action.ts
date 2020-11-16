import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.STOP,
    type: 'button',
    icon: 'stop',
    color: ButtonColor.WARN,
    name: 'general.stop',
    tooltip: 'general.tooltips.stop',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
