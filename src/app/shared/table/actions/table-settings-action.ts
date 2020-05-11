import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';

import { TableAction } from './table-action';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SETTINGS,
    type: 'button',
    icon: 'settings',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.settings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
