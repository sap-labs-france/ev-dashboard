import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsForceUnavailableStatusAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.FORCE_UNAVAILABLE_STATUS,
    type: 'button',
    icon: 'close',
    color: ButtonColor.WARN,
    name: 'chargers.force_unavailable_status_action',
    tooltip: 'general.tooltip.force_unavailable_status',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
