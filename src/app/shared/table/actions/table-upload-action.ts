import { OicpButtonAction } from 'types/oicp/OICPEndpoint';

import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { OCPIButtonAction } from '../../../types/ocpi/OCPIEndpoint';
import { SiteButtonAction } from '../../../types/Site';
import { TableActionDef } from '../../../types/Table';
import { TransactionButtonAction } from '../../../types/Transaction';
import { UserButtonAction } from '../../../types/User';
import { TableAction } from './table-action';

export class TableUploadAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SEND,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonActionColor.PRIMARY,
    name: 'general.upload',
    tooltip: 'general.tooltips.upload',
  };

  public constructor(
    id?:
    | ButtonAction
    | ChargingStationButtonAction
    | UserButtonAction
    | TransactionButtonAction
    | SiteButtonAction
    | OCPIButtonAction
    | OicpButtonAction,
    name?: string,
    tooltip?: string
  ) {
    if (id) {
      this.action.id = id;
    }
    if (name) {
      this.action.name = name;
    }
    if (tooltip) {
      this.action.tooltip = tooltip;
    }
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
