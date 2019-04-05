import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInProgressDataSource} from './transactions-in-progress-data-source-table';
import {MessageService} from '../../../services/message.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html',
  providers: [
    TransactionsInProgressDataSource
  ]
})
export class TransactionsInProgressComponent implements OnInit {
  public isAdmin;

  constructor(
    public transactionsInProgressDataSource: TransactionsInProgressDataSource,
    private windowService: WindowService,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit(): void {
    // Check if transaction ID id provided
    const transactionId = this.activatedRoute.snapshot.queryParams['TransactionID'];
    if (transactionId) {
      this.centralServerService.getTransaction(transactionId).subscribe(transaction => {
        // Found
        this.transactionsInProgressDataSource.openSession(transaction);
      }, (error) => {
        // Not Found
        this.messageService.showErrorMessage('transactions.transaction_id_not_found', {'sessionID': transactionId});
      });
      // Clean URL
      this.windowService.setSearch('');
    }
  }
}
