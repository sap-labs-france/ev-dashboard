import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from 'app/shared/dialogs/transactions/transaction-dialog.component';
import { TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Observable } from 'rxjs';

import { TableViewAction } from './table-view-action';

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
