import { ButtonColor, TableActionDef } from '../../../types/Table';

import { ButtonAction } from '../../../types/GlobalType';
import { TableAction } from './table-action';

export class TableNoAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.NO_ACTION,
    type: 'button',
    icon: 'block',
    color: ButtonColor.PRIMARY,
    name: 'general.no_action',
    tooltip: 'general.tooltips.no_action',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
