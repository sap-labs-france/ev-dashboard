import { Component } from '@angular/core';
import { TransactionsInErrorTableDataSource } from './transactions-in-error-table-data-source';

@Component({
  selector: 'app-transactions-in-error',
  templateUrl: 'transactions-in-error.component.html',
  providers: [TransactionsInErrorTableDataSource]
})
export class TransactionsInErrorComponent {
  constructor(
    public transactionsInErrorDataSource: TransactionsInErrorTableDataSource) {
  }
}
