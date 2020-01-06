import { TableAction } from 'app/shared/table/actions/table-action';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export const ACTION_SEND = 'send';
export const ACTION_STOP_START_JOB = 'stop_start_job';

export class SettingsOcpiEnpointsMoreAction implements TableAction {
  private action: TableActionDef = {
    id: 'more',
    type: 'button',
    icon: 'more_horiz',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownItems: [
      {
        id: ACTION_SEND,
        name: 'ocpiendpoints.sendEVSEStatuses_title',
        icon: 'cast',
        tooltip: 'ocpiendpoints.sendEVSEStatuses_title',
      }, {
        id: ACTION_STOP_START_JOB,
        name: 'ocpiendpoints.start_stop_job',
        icon: 'av_timer',
        tooltip: 'ocpiendpoints.start_stop_job',
      },
    ],
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
