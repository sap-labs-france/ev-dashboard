import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableSaveAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.INLINE_SAVE,
    type: ActionType.BUTTON,
    icon: 'save',
    color: ButtonActionColor.PRIMARY,
    name: 'general.save',
    tooltip: 'general.tooltips.save',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
