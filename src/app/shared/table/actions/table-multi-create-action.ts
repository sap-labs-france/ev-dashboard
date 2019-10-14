import { ButtonColor, DropdownItem, TableActionDef } from '../../../common.types';
import {
  ACTION_CLEAR_CACHE,
  ACTION_SMART_CHARGING,
} from '../../../pages/charging-stations/actions/charging-stations-more-action';
import { TableAction } from './table-action';

export class TableMultiCreateAction implements TableAction {
  private action: TableActionDef = {
    id: 'multi-create',
    type: 'dropdown-button',
    icon: 'more_vert',
    color: ButtonColor.primary,
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
