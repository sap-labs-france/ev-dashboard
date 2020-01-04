import { TableAction } from 'app/shared/table/actions/table-action';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsRebootAction implements TableAction {
  private action: TableActionDef = {
    id: 'reboot',
    type: 'button',
    icon: 'repeat',
    color: ButtonColor.WARN,
    name: 'general.edit',
    tooltip: 'general.tooltips.reboot',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
