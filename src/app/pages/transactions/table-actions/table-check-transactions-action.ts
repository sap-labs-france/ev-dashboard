import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { TransactionButtonAction } from 'app/types/Transaction';

export class TableCheckTransactionsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.CHECK_TRANSACTIONS,
      name: 'transactions.redirect',
      tooltip: 'transactions.redirect'
    };
  }
}
