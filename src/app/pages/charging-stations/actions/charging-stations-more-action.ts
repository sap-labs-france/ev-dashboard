import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class ChargingStationsMoreAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.MORE,
    type: 'button',
    color: ButtonColor.PRIMARY,
    icon: 'more_horiz',
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownItems: [
      {
        id: ChargingStationButtonAction.SMART_CHARGING,
        name: 'chargers.more_actions_items.smart_charging_item',
        icon: 'battery_charging_full',
        tooltip: 'general.tooltips.smartcharging',
      },
      {
        id: ChargingStationButtonAction.CLEAR_CACHE,
        name: 'chargers.more_actions_items.clear_cache_item',
        icon: 'layers_clear',
        tooltip: 'general.tooltips.clear_cache',
      },
      {
        id: ChargingStationButtonAction.SOFT_RESET,
        name: 'chargers.more_actions_items.soft_reset_item',
        icon: 'refresh',
        tooltip: 'general.tooltips.soft_reset',
      },
      {
        id: ButtonAction.DELETE,
        icon: 'delete',
        name: 'general.delete',
        tooltip: 'general.tooltips.delete',
      },
    ],
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
