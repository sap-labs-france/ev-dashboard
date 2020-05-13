import { Component } from '@angular/core';

import { TransactionsInErrorTableDataSource } from './transactions-in-error-table-data-source';

@Component({
  selector: 'app-transactions-in-error',
  template: '<app-table [dataSource]="transactionsInErrorDataSource"></app-table>',
  providers: [TransactionsInErrorTableDataSource],
})
export class TransactionsInErrorComponent {
  constructor(
    public transactionsInErrorDataSource: TransactionsInErrorTableDataSource) {
  }
}
