import { ButtonColor, TableActionDef } from 'app/common.types';
import { TableAction } from 'app/shared/table/actions/table-action';

export class ChargingStationsRebootAction implements TableAction {
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
