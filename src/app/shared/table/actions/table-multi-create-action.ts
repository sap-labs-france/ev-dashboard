import { ButtonAction } from '../../../types/GlobalType';
import { ButtonActionColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableMultiCreateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MULTI_CREATE,
    type: 'dropdown-button',
    icon: 'more_vert',
    color: ButtonActionColor.PRIMARY,
    name: 'general.create',
    tooltip: 'general.tooltips.create',
    isDropdownMenu: true,
    dropdownActions: [],
  };

  public constructor(dropdownActions: TableActionDef[]) {
    this.action.dropdownActions = dropdownActions;
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
