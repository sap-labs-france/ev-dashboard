import { TransactionButtonAction } from '../../../../types/Transaction';
import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableNavigateToTransactionsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS,
      name: 'transactions.redirect',
      tooltip: 'transactions.redirect',
    };
  }
}
