import { ButtonAction } from '../../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../../types/Table';
import { TableAction } from './../table-action';

export class TablePricingOverviewAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OVERVIEW,
    type: ActionType.SLIDE,
    currentValue: false,
    visible: true,
    name: 'transactions.dialog.session.pricing-detail-view-all',
    tooltip: 'transactions.dialog.session.pricing-detail-view-all',
  };

  public constructor(
    private defaultValue: boolean = false) {
    // Set
    this.action.currentValue = defaultValue;
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

}
