import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData, DialogParams } from 'types/Authorization';

import { TableActionDef } from '../../../../types/Table';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { TableViewAction } from '../table-view-action';

export interface TransactionDialogData extends DialogData {
  transactionID?: number;
  chargingStationID?: string;
  connectorID?: number;
}
export interface TableViewTransactionActionDef extends TableActionDef {
  action: (
    transactionDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<TransactionDialogData>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewTransactionAction extends TableViewAction {
  public getActionDef(): TableViewTransactionActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.VIEW_TRANSACTION,
      action: this.viewTransaction,
    };
  }

  private viewTransaction(
    transactionDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<TransactionDialogData>,
    refresh?: () => Observable<void>
  ) {
    super.view(transactionDialogComponent, dialog, dialogParams, refresh);
  }
}
