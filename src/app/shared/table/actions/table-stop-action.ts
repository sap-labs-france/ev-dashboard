import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: 'stop',
    type: 'button',
    icon: 'stop',
    color: ButtonColor.warn,
    name: 'general.stop',
    tooltip: 'general.tooltips.stop',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
