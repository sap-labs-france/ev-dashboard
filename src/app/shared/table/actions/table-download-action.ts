import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { OCPIButtonAction } from '../../../types/ocpi/OCPIEndpoint';
import { SiteButtonAction } from '../../../types/Site';
import { TableActionDef } from '../../../types/Table';
import { TransactionButtonAction } from '../../../types/Transaction';
import { UserButtonAction } from '../../../types/User';
import { TableAction } from './table-action';

export class TableDownloadAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.DOWNLOAD,
    type: 'button',
    icon: 'cloud_download',
    color: ButtonActionColor.PRIMARY,
    name: 'general.download',
    tooltip: 'invoices.tooltips.download',
  };

  public constructor(
    id?:
    | ButtonAction
    | ChargingStationButtonAction
    | UserButtonAction
    | TransactionButtonAction
    | SiteButtonAction
    | OCPIButtonAction,
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
