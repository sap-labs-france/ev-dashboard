import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableMoreAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MORE,
    type: 'button',
    icon: 'more_horiz',
    color: ButtonActionColor.BASIC,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownActions: [],
  };

  public constructor(dropdownActions: TableActionDef[]) {
    if (this.action.dropdownActions) {
      this.action.dropdownActions.push(...dropdownActions);
    }
  }

  public addActionInMoreActions(actionDef: TableActionDef) {
    if (this.action && this.action.dropdownActions) {
      this.action.dropdownActions.push(actionDef);
    }
  }

  public getActionsInMoreActions(): TableActionDef[] {
    if (this.action.dropdownActions) {
      return this.action.dropdownActions;
    }
    return [];
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
