import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableSettingsAction implements TableAction {
  private action: TableActionDef = {
    id: 'settings',
    type: 'button',
    icon: 'settings',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.settings'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
