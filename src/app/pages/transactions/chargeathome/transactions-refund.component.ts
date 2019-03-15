import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsRefundDataSource} from './transactions-refund-data-source-table';

@Component({
  selector: 'app-transactions-refund',
  templateUrl: 'transactions-refund.component.html',
  providers: [
    TransactionsRefundDataSource
  ]
})
export class TransactionsRefundComponent implements OnInit {
  public isAdmin;

  constructor(
    public transactionsRefundDataSource: TransactionsRefundDataSource,
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsRefundDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
