import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { ButtonAction } from '../../../types/GlobalType';
import { SiteButtonAction } from '../../../types/Site';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TransactionButtonAction } from '../../../types/Transaction';
import { UserButtonAction } from '../../../types/User';
import { OcpiButtonAction } from '../../../types/ocpi/OCPIEndpoint';
import { TableAction } from './table-action';

export class TableUploadAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.SEND,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonColor.PRIMARY,
    name: 'general.upload',
    tooltip: 'general.tooltips.upload',
  };

  constructor(id?: ButtonAction | ChargingStationButtonAction | UserButtonAction | TransactionButtonAction | SiteButtonAction | OcpiButtonAction,
    name?: string, tooltip?: string) {
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
