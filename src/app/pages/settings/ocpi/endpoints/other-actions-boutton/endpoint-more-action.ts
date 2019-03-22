import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef } from 'app/common.types';

export const ACTION_SEND = 'send';
export const ACTION_STOP_START_JOB = 'stop_start_job';

export class EndpointMoreAction implements TableAction {
  private action: TableActionDef = {
    id: 'more',
    type: 'button',
    icon: 'more_horiz',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
    isDropdownMenu: true,
    dropdownItems: [
      { id: ACTION_SEND, name: 'ocpiendpoints.sendEVSEStatuses_title',
        icon: 'cast', tooltip: 'ocpiendpoints.sendEVSEStatuses_title' },
      { id: ACTION_STOP_START_JOB, name: 'ocpiendpoints.start_stop_job',
        icon: 'av_timer', tooltip: 'ocpiendpoints.start_stop_job' },
    ]
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
