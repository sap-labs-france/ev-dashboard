import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
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
    private centralServerService: CentralServerService,
    private messageService: MessageService,
  ) {
  }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionID = this.windowService.getSearch('TransactionID');
    if (transactionID) {
      this.centralServerService.getTransaction(transactionID).subscribe((transaction) => {
        // Found
        this.transactionsHistoryTableDataSource.openSession(transaction);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {sessionID: transactionID});
      });
      // Clear Search
      this.windowService.deleteSearch('TransactionID');
    }
  }
}
