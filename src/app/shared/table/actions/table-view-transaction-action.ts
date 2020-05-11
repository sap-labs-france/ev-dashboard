import { Transaction, TransactionButtonAction } from 'app/types/Transaction';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableViewAction } from './table-view-action';
import { TransactionDialogComponent } from 'app/shared/dialogs/transactions/transaction-dialog.component';

export class TableViewTransactionAction extends TableViewAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.VIEW_TRANSACTION,
      action: this.viewTransaction,
    };
  }

  private viewTransaction(transaction: Transaction, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.view(TransactionDialogComponent, transaction, dialog, refresh);
  }
}
