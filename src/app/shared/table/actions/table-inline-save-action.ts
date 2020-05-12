import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';

import { TableAction } from './table-action';

export class TableInlineSaveAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.INLINE_SAVE,
    type: 'button',
    icon: 'save',
    color: ButtonColor.PRIMARY,
    name: 'general.save',
    tooltip: 'general.tooltips.save',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
