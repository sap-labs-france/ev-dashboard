import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableUnregisterAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.UNREGISTER,
    type: 'button',
    icon: 'link_off',
    color: ButtonActionColor.PRIMARY,
    name: 'general.unregister',
    tooltip: 'general.tooltips.unregister',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
