import {Component} from '@angular/core';
import {TransactionsRefundDataSource} from './transactions-refund-data-source-table';

@Component({
  selector: 'app-transactions-refund',
  templateUrl: 'transactions-refund.component.html',
  providers: [
    TransactionsRefundDataSource
  ]
})
export class TransactionsRefundComponent {
  constructor(
    public transactionsRefundDataSource: TransactionsRefundDataSource) {
  }
}
