import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { TableAction } from './table-action';

export class TableOpenInConcurAction implements TableAction {
  private action: TableActionDef = {
    id: TransactionButtonAction.OPEN_IN_CONCUR,
    type: 'button',
    icon: 'open_in_new',
    color: ButtonColor.PRIMARY,
    name: 'general.open_in_concur',
    tooltip: 'general.tooltips.open',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
