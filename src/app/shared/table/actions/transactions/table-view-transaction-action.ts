import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableActionDef } from '../../../../types/Table';
import { Transaction, TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TransactionDialogComponent } from '../../../dialogs/transaction/transaction.dialog.component';
import { TableViewAction } from '../table-view-action';

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
