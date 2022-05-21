import { ButtonAction } from '../../../types/GlobalType';
import { ButtonActionColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SETTINGS,
    type: 'button',
    icon: 'settings',
    color: ButtonActionColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.settings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
