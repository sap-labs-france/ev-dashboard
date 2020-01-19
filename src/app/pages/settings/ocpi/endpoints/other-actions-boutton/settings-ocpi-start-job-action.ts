import { TableAction } from 'app/shared/table/actions/table-action';
import { OcpiButtonAction } from 'app/types/OCPIEndpoint';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class SettingsOCPIStartJobAction implements TableAction {
  private action: TableActionDef = {
    id: OcpiButtonAction.START_JOB,
    type: 'button',
    icon: 'av_timer',
    color: ButtonColor.PRIMARY,
    name: 'ocpiendpoints.start_stop_job',
    tooltip: 'ocpiendpoints.start_stop_job',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
