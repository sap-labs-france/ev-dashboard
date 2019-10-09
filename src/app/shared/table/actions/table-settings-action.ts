import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: 'settings',
    type: 'button',
    icon: 'settings',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.settings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
