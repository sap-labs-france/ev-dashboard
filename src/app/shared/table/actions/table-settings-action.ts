import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: 'settings',
    type: 'button',
    icon: 'settings',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.settings'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
