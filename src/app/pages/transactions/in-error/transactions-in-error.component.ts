import {Component, OnInit} from '@angular/core';
import {AuthorizationService} from '../../../services/authorization-service';
import {TransactionsInErrorDataSource} from './transactions-in-error-data-source-table';

@Component({
  selector: 'app-transactions-in-error',
  templateUrl: 'transactions-in-error.component.html',
  providers: [
    TransactionsInErrorDataSource
  ]
})
export class TransactionsInErrorComponent implements OnInit {
  public isAdmin;

  constructor(
    public transactionsInErrorDataSource: TransactionsInErrorDataSource,
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.transactionsInErrorDataSource.forAdmin(this.isAdmin);
  }

  ngOnInit() {
    // Scroll up
    jQuery('html, body').animate({scrollTop: 0}, {duration: 500});
  }
}
