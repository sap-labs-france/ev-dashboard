import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableStartAction implements TableAction {
  private action: TableActionDef = {
    id: 'start',
    type: 'button',
    icon: 'play_arrow',
    color: ButtonColor.accent,
    name: 'general.start',
    tooltip: 'general.tooltips.start'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
