import { Component } from '@angular/core';
import { TransactionsRefundTableDataSource } from './transactions-refund-table-data-source';

@Component({
  selector: 'app-transactions-refund',
  templateUrl: 'transactions-refund.component.html',
  providers: [TransactionsRefundTableDataSource],
})
export class TransactionsRefundComponent {
  constructor(
    public transactionsRefundTableDataSource: TransactionsRefundTableDataSource) {
  }
}
