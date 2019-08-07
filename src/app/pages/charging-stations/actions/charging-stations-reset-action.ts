import { ButtonColor, TableActionDef } from 'app/common.types';
import { TableAction } from 'app/shared/table/actions/table-action';

export class ChargingStationsResetAction implements TableAction {
  private action: TableActionDef = {
    id: 'soft_reset',
    type: 'button',
    icon: 'refresh',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.soft_reset'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
