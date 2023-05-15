import { Component } from '@angular/core';

import { TransactionsInErrorTableDataSource } from './transactions-in-error-table-data-source';

@Component({
  selector: 'app-transactions-in-error',
  template: '<app-table [dataSource]="transactionsInErrorDataSource"></app-table>',
  providers: [TransactionsInErrorTableDataSource],
})
export class TransactionsInErrorComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public transactionsInErrorDataSource: TransactionsInErrorTableDataSource) {}
}
