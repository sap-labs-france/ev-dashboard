import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from 'app/pages/transactions/transaction/transaction.dialog.component';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Data, TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

interface LastTransactionOnConnector {
  transactionID: number;
  chargingStationID: string;
  connectorID: number;
}

export interface TableViewTransactionActionDef extends TableActionDef {
  action: (transaction: Transaction|LastTransactionOnConnector, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableViewTransactionAction extends TableViewAction {
  public getActionDef(): TableViewTransactionActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.VIEW_TRANSACTION,
      action: this.viewTransaction,
    };
  }

  private viewTransaction(transaction: Transaction|LastTransactionOnConnector, dialog: MatDialog, refresh?: () => Observable<void>) {
    let data: any;
    // From Transaction
    if (Utils.objectHasProperty(transaction, 'id')) {
      data = (transaction as Transaction).id;
    // From Charging Station
    } else {
      data = transaction;
    }
    super.view(TransactionDialogComponent, data, dialog, refresh);
  }
}
