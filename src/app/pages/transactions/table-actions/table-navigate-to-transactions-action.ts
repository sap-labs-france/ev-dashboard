import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { TransactionButtonAction } from 'app/types/Transaction';

export class TableNavigateToTransactionsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS,
      name: 'transactions.redirect',
      tooltip: 'transactions.redirect'
    };
  }
}
