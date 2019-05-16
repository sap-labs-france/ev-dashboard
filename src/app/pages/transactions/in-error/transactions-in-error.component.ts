import {Component} from '@angular/core';
import {TransactionsInErrorDataSource} from './transactions-in-error-data-source-table';

@Component({
  selector: 'app-transactions-in-error',
  templateUrl: 'transactions-in-error.component.html',
  providers: [
    TransactionsInErrorDataSource
  ]
})
export class TransactionsInErrorComponent {
  constructor(
    public transactionsInErrorDataSource: TransactionsInErrorDataSource) {
  }
}
