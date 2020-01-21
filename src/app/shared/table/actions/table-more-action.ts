import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableMoreAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MORE,
    type: 'button',
    icon: 'more_horiz',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownActions: [],
  };

  constructor(dropdownActions: TableActionDef[]) {
    if (this.action.dropdownActions) {
      this.action.dropdownActions.push(...dropdownActions);
    }
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
