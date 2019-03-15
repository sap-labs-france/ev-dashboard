import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsHistoryDataSource} from './transactions-history-data-source-table';

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
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsHistoryDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
