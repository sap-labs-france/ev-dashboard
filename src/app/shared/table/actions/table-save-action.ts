import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableSaveAction implements TableAction {
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
