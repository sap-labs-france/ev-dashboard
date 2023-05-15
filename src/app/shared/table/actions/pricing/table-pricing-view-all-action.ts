import { ButtonAction } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TableAction } from '../table-action';

export class TablePricingViewAllAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW_ALL,
    type: 'slide',
    currentValue: false,
    visible: true,
    name: 'transactions.dialog.session.pricing_detail_view_all',
    tooltip: 'transactions.dialog.session.pricing_detail_view_all',
  };

  public constructor(private defaultValue: boolean = false) {
    // Set
    this.action.currentValue = defaultValue;
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
