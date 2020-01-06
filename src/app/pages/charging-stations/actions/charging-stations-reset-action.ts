import { TableAction } from 'app/shared/table/actions/table-action';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsResetAction implements TableAction {
  private action: TableActionDef = {
    id: 'soft_reset',
    type: 'button',
    icon: 'refresh',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.soft_reset',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
