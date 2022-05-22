import { ButtonActionColor } from 'types/GlobalType';

import { TableAction } from '../../../../../shared/table/actions/table-action';
import { OCPIButtonAction } from '../../../../../types/ocpi/OCPIEndpoint';
import { TableActionDef } from '../../../../../types/Table';

export class SettingsOCPIStartJobAction implements TableAction {
  private action: TableActionDef = {
    id: OCPIButtonAction.START_JOB,
    type: 'button',
    icon: 'av_timer',
    color: ButtonActionColor.PRIMARY,
    name: 'ocpiendpoints.start_stop_job',
    tooltip: 'ocpiendpoints.start_stop_job',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
