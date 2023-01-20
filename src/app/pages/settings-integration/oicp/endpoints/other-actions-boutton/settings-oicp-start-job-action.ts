import { ButtonActionColor } from 'types/GlobalType';

import { TableAction } from '../../../../../shared/table/actions/table-action';
import { OicpButtonAction } from '../../../../../types/oicp/OICPEndpoint';
import { ActionType, TableActionDef } from '../../../../../types/Table';

export class SettingsOICPStartJobAction implements TableAction {
  private action: TableActionDef = {
    id: OicpButtonAction.START_JOB,
    type: ActionType.BUTTON,
    icon: 'av_timer',
    color: ButtonActionColor.PRIMARY,
    name: 'oicpendpoints.start_stop_job',
    tooltip: 'oicpendpoints.start_stop_job',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
