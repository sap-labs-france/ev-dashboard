import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from '../../../../shared/table/actions/table-action';
import { BillingButtonAction } from '../../../../types/Billing';
import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { OcpiButtonAction } from '../../../../types/OCPIEndpoint';
import { SiteButtonAction } from '../../../../types/Site';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { UserButtonAction } from '../../../../types/User';

export class TablePayInvoiceAction implements TableAction {
  private action: TableActionDef = {
    id: BillingButtonAction.PAY_INVOICE,
    type: 'button',
    icon: 'credit_card',
    color: ButtonColor.PRIMARY,
    name: 'invoices.pay',
    tooltip: 'invoices.tooltips.pay',
  };

  constructor(id?: ButtonAction | ChargingStationButtonAction | UserButtonAction | TransactionButtonAction | SiteButtonAction | OcpiButtonAction | BillingButtonAction,
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
