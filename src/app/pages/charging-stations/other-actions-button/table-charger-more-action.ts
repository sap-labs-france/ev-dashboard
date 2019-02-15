import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef } from 'app/common.types';

export const ACTION_REBOOT = 'REBOOT';
export const ACTION_SOFT_RESET = 'SOFT_RESET';
export const ACTION_CLEAR_CACHE = 'CLEAR_CACHE';
export const ACTION_SMART_CHARGING = 'SMART_CHARGING';
export const ACTION_MORE_ACTIONS = 'MORE_ACTIONS';

export class TableChargerMoreAction implements TableAction {
  private action: TableActionDef = {
    id: 'more',
    type: 'button',
    icon: 'more_horiz',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownItems: [
      { id: ACTION_CLEAR_CACHE, name: 'chargers.more_actions_items.clear_cache_item',
      icon: 'layers_clear', tooltip: 'general.tooltips.clear_cache' },
      { id: ACTION_SOFT_RESET, name: 'chargers.more_actions_items.soft_reset_item',
      icon: 'refresh', tooltip: 'general.tooltips.soft_reset' },
      // { id: 'sitearea', icon: 'view_week', name: 'chargers.assign_sitearea_action', tooltip: 'chargers.assign_sitearea_action_tooltip' },
      { id: 'delete', icon: 'delete', name: 'general.remove',
      tooltip: 'general.tooltips.delete'},
      { id: ACTION_MORE_ACTIONS, name: 'chargers.more_actions_items.more_actions_item',
      icon: 'more_horiz', tooltip: 'general.tooltips.more_actions' }
    ]
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
