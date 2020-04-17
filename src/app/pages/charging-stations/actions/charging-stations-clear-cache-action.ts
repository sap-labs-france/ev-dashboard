import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsClearCacheAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.CLEAR_CACHE,
    type: 'button',
    icon: 'layers_clear',
    color: ButtonColor.PRIMARY,
    name: 'chargers.clear_cache_action',
    tooltip: 'general.tooltips.clear_cache',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
