import { TableAction } from 'app/shared/table/actions/table-action';
import { OcpiButtonAction } from 'app/types/OCPIEndpoint';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class SettingsOCPISendAction implements TableAction {
  private action: TableActionDef = {
    id: OcpiButtonAction.SEND,
    type: 'button',
    icon: 'cast',
    color: ButtonColor.PRIMARY,
    name: 'ocpiendpoints.send_evse_statuses_title',
    tooltip: 'ocpiendpoints.send_evse_statuses_title',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
