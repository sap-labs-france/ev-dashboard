import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef, ButtonColor } from 'app/common.types';

export class TableChargerRebootAction implements TableAction {
  private action: TableActionDef = {
    id: 'reboot',
    type: 'button',
    icon: 'repeat',
    color: ButtonColor.warn,
    name: 'general.edit',
    tooltip: 'general.tooltips.reboot'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
