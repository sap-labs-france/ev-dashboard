import { ButtonActionColor } from 'types/GlobalType';
import { OCPIButtonAction } from 'types/ocpi/OCPIEndpoint';

import { TableActionDef } from '../../../../types/Table';
import { TableAction } from '../table-action';

export class TableUpdateOCPICredentialsAction implements TableAction {
  private action: TableActionDef = {
    id: OCPIButtonAction.UPDATE_CREDENTIALS,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonActionColor.PRIMARY,
    name: 'ocpi.update_credentials',
    tooltip: 'ocpi.update_credentials',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
