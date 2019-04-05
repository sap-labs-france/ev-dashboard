import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInProgressDataSource} from './transactions-in-progress-data-source-table';
import { CentralServerService } from 'app/services/central-server.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transactions-in-progress',
  templateUrl: 'transactions-in-progress.component.html',
  providers: [
    TransactionsInProgressDataSource
  ]
})
export class TransactionsInProgressComponent implements OnInit {
  public isAdmin;
  private _transactionId;

  constructor(
    public transactionsInProgressDataSource: TransactionsInProgressDataSource,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit(): void {
    this._transactionId = this.activatedRoute.snapshot.queryParams['TransactionID'];
    if(this._transactionId){
      this.centralServerService.getTransaction(this._transactionId).subscribe(transaction => {
        if(transaction) {
          this.transactionsInProgressDataSource.openSession(transaction);
        }
      })
    }
  }
}
