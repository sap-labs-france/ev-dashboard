import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsHistoryDataSource} from './transactions-history-data-source-table';
import { CentralServerService } from 'app/services/central-server.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transactions-history',
  templateUrl: 'transactions-history.component.html',
  providers: [
    TransactionsHistoryDataSource
  ]
})
export class TransactionsHistoryComponent implements OnInit {
  public isAdmin;
  private _transactionId;

  constructor(
    public transactionsHistoryDataSource: TransactionsHistoryDataSource,
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private activatedRoute: ActivatedRoute
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsHistoryDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit(): void{
    this._transactionId = this.activatedRoute.snapshot.queryParams['TransactionID'];
    if(this._transactionId){
      this.centralServerService.getTransaction(this._transactionId).subscribe(transaction => {
        if(transaction) {
          this.transactionsHistoryDataSource.openSession(transaction);
        }
      })
    }
  }
}
