import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableMultiCopyAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MULTI_COPY,
    type: 'button',
    icon: 'file_copy',
    color: ButtonActionColor.PRIMARY,
    name: 'general.copy',
    tooltip: 'general.tooltips.copy',
    isDropdownMenu: true,
    dropdownActions: [],
  };

  public constructor(dropdownActions: TableActionDef[], name?: string, tooltip?: string) {
    if (name) {
      this.action.name = name;
    }
    if (tooltip) {
      this.action.tooltip = tooltip;
    }
    if (dropdownActions) {
      this.action.dropdownActions.push(...dropdownActions);
    }
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
