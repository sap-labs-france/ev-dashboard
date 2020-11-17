import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TableViewTransactionAction } from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { Utils } from '../../../utils/Utils';
import { TransactionsHistoryTableDataSource } from './transactions-history-table-data-source';

@Component({
  selector: 'app-transactions-history',
  template: '<app-table [dataSource]="transactionsHistoryTableDataSource"></app-table>',
  providers: [TransactionsHistoryTableDataSource],
})
export class TransactionsHistoryComponent implements OnInit {
  constructor(
    public transactionsHistoryTableDataSource: TransactionsHistoryTableDataSource,
    private windowService: WindowService,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
  ) {
  }

  public ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionID = Utils.convertToInteger(this.windowService.getSearch('TransactionID'));
    if (transactionID) {
      this.centralServerService.getTransaction(transactionID).subscribe((transaction) => {
        const viewAction = new TableViewTransactionAction().getActionDef();
        if (viewAction.action) {
          viewAction.action(transaction, this.dialog);
        }
      }, (error) => {
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {sessionID: transactionID});
      });
      // Clear Search
      this.windowService.deleteSearch('TransactionID');
    }
  }
}
