import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableUnregisterAction implements TableAction {
  private action: TableActionDef = {
    id: 'unregister',
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
