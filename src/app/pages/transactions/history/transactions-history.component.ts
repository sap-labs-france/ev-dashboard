import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TransactionsHistoryDataSource } from './transactions-history-data-source-table';

@Component({
  selector: 'app-transactions-history',
  templateUrl: 'transactions-history.component.html'
})
export class TransactionsHistoryComponent implements OnInit {
  constructor(
    public transactionsHistoryDataSource: TransactionsHistoryDataSource,
    private windowService: WindowService,
    private centralServerService: CentralServerService,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionID = this.windowService.getSearch('TransactionID');
    if (transactionID) {
      this.centralServerService.getTransaction(transactionID).subscribe(transaction => {
        // Found
        this.transactionsHistoryDataSource.openSession(transaction);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {'sessionID': transactionID});
      });
      // Clear Search
      this.windowService.deleteSearch('TransactionID');
    }
  }
}
