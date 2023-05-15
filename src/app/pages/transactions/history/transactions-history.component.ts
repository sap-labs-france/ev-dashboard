import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction-dialog.component';
import { DialogMode } from 'types/Authorization';

import { WindowService } from '../../../services/window.service';
import {
  TableViewTransactionAction,
  TransactionDialogData,
} from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { Utils } from '../../../utils/Utils';
import { TransactionsHistoryTableDataSource } from './transactions-history-table-data-source';

@Component({
  selector: 'app-transactions-history',
  template: '<app-table [dataSource]="transactionsHistoryTableDataSource"></app-table>',
  providers: [TransactionsHistoryTableDataSource],
})
export class TransactionsHistoryComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public transactionsHistoryTableDataSource: TransactionsHistoryTableDataSource,
    private windowService: WindowService,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionID = Utils.convertToInteger(
      this.windowService.getUrlParameterValue('TransactionID')
    );
    if (transactionID) {
      const viewAction = new TableViewTransactionAction().getActionDef();
      viewAction.action(TransactionDialogComponent, this.dialog, {
        dialogData: { transactionID } as TransactionDialogData,
        dialogMode: DialogMode.VIEW,
      });
      // Clear Search
      this.windowService.deleteUrlParameter('TransactionID');
    }
  }
}
