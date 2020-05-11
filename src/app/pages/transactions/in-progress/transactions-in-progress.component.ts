import { Component, OnInit } from '@angular/core';

import { CentralServerService } from 'app/services/central-server.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';
import { TableViewTransactionAction } from 'app/shared/table/actions/table-view-transaction-action';
import { TransactionsInProgressTableDataSource } from './transactions-in-progress-table-data-source';
import { Utils } from 'app/utils/Utils';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'app-transactions-in-progress',
  template: '<app-table [dataSource]="transactionsInProgressTableDataSource"></app-table>',
  providers: [TransactionsInProgressTableDataSource],
})
export class TransactionsInProgressComponent implements OnInit {

  constructor(
    public transactionsInProgressTableDataSource: TransactionsInProgressTableDataSource,
    private dialog: MatDialog,
    private windowService: WindowService,
    private centralServerService: CentralServerService,
    private messageService: MessageService) {
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
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {sessionID: transactionID});
      });
      // Clear Search
      this.windowService.deleteSearch('TransactionID');
    }
  }
}
