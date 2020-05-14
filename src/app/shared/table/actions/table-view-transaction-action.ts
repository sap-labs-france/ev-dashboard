import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from 'app/pages/transactions/transaction/transaction.dialog.component';
import { Data, TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
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
    let data: Data|number;
    // From Transaction
    if (Utils.objectHasProperty(transaction, 'id')) {
      data = transaction.id;
    // From Charging Station
    } else {
      data = transaction;
    }
    super.view(TransactionDialogComponent, data, dialog, refresh);
  }
}
