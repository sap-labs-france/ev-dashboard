import { Component, OnInit } from '@angular/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TransactionsInProgressDataSource } from './transactions-in-progress-data-source-table';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html',
  providers: [TransactionsInProgressDataSource]
})
export class TransactionsInProgressComponent implements OnInit {

  constructor(
    public transactionsInProgressDataSource: TransactionsInProgressDataSource,
    private windowService: WindowService,
    private centralServerService: CentralServerService,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionID = this.windowService.getSearch('TransactionID');
    if (transactionID) {
      this.centralServerService.getTransaction(transactionID).subscribe(transaction => {
        // Found
        this.transactionsInProgressDataSource.openSession(transaction);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {'sessionID': transactionID});
      });
      // Clear Search
      this.windowService.deleteSearch('TransactionID');
    }
  }
}
