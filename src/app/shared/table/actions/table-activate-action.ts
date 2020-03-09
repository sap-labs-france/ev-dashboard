import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableActivateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.ACTIVATE,
    type: 'button',
    icon: 'link',
    color: ButtonColor.PRIMARY,
    name: 'general.activate',
    tooltip: 'general.tooltips.activate',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
