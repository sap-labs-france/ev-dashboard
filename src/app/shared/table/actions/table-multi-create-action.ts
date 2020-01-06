import { ButtonColor, DropdownItem, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableMultiCreateAction implements TableAction {
  private action: TableActionDef = {
    id: 'multi-create',
    type: 'dropdown-button',
    icon: 'more_vert',
    color: ButtonColor.PRIMARY,
    name: 'general.create',
    tooltip: 'general.tooltips.create',
    isDropdownMenu: true,
    dropdownItems: [],
  };

  constructor(dropdownItems: DropdownItem[]) {
    this.action.dropdownItems = dropdownItems;
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
