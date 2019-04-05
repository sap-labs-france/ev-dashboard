import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsHistoryDataSource} from './transactions-history-data-source-table';
import {MessageService} from '../../../services/message.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'app-transactions-history',
  templateUrl: 'transactions-history.component.html',
  providers: [
    TransactionsHistoryDataSource
  ]
})
export class TransactionsHistoryComponent implements OnInit {
  public isAdmin;

  constructor(
    public transactionsHistoryDataSource: TransactionsHistoryDataSource,
    private windowService: WindowService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsHistoryDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionId = this.activatedRoute.snapshot.queryParams['TransactionID'];
    if (transactionId) {
      this.centralServerService.getTransaction(transactionId).subscribe(transaction => {
        // Found
        this.transactionsHistoryDataSource.openSession(transaction);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {'sessionID': transactionId});
      });
      // Clear Search
      this.windowService.clearSearch();
    }
  }
}
