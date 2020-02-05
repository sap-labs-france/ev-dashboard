import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsForceAvailableStatusAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.FORCE_AVAILABLE_STATUS,
    type: 'button',
    icon: 'check',
    color: ButtonColor.PRIMARY,
    name: 'chargers.force_available_status_action',
    tooltip: 'general.tooltip.force_available_status',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
