import { OcpiButtonAction } from 'types/ocpi/OCPIEndpoint';

import { ButtonColor, TableActionDef } from '../../../../types/Table';
import { TableAction } from '../table-action';

export class TableUpdateOCPICredentialsAction implements TableAction {
  private action: TableActionDef = {
    id: OcpiButtonAction.UPDATE_CREDENTIALS,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonColor.PRIMARY,
    name: 'ocpi.update_credentials',
    tooltip: 'ocpi.update_credentials',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
