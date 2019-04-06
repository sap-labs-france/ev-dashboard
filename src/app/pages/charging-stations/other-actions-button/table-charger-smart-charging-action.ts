import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef, ButtonColor } from 'app/common.types';
import { ACTION_SMART_CHARGING } from './table-charger-more-action';

export class TableChargerSmartChargingAction implements TableAction {
  private action: TableActionDef = {
    id: ACTION_SMART_CHARGING,
    type: 'button',
    name: 'chargers.more_actions_items.smart_charging_item',
    icon: 'battery_charging_full',
    tooltip: 'general.tooltips.smart_charging',
    color: ButtonColor.accent
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
