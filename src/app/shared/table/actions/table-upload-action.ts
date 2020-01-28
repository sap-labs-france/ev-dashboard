import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { OcpiButtonAction } from '../../../types/OCPIEndpoint';
import { SiteButtonAction } from '../../../types/Site';
import { TransactionButtonAction } from '../../../types/Transaction';
import { UserButtonAction } from '../../../types/User';
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
