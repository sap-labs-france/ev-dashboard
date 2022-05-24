import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableStartAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.START,
    type: 'button',
    icon: 'play_arrow',
    color: ButtonActionColor.ACCENT,
    name: 'general.start',
    tooltip: 'general.tooltips.start',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
