import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableUnregisterAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.UNREGISTER,
    type: 'button',
    icon: 'link_off',
    color: ButtonColor.PRIMARY,
    name: 'general.unregister',
    tooltip: 'general.tooltips.unregister',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
