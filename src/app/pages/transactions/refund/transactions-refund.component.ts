import { Component } from '@angular/core';

import { TransactionsRefundTableDataSource } from './transactions-refund-table-data-source';

@Component({
  selector: 'app-transactions-refund',
  template: '<app-table [dataSource]="transactionsRefundTableDataSource"></app-table>',
  providers: [TransactionsRefundTableDataSource],
})
export class TransactionsRefundComponent {
  constructor(
    public transactionsRefundTableDataSource: TransactionsRefundTableDataSource) {
  }
}
