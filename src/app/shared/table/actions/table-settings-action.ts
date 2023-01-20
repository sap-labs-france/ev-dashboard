import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SETTINGS,
    type: ActionType.BUTTON,
    icon: 'settings',
    color: ButtonActionColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.settings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
