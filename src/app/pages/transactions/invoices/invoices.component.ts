import { Component } from '@angular/core';
import { InvoicesTableDataSource } from './invoices-table-data-source';

@Component({
  selector: 'app-invoices',
  templateUrl: 'invoices.component.html',
  providers: [InvoicesTableDataSource],
})
export class InvoicesComponent {
  constructor(
    public transactionsRefundTableDataSource: InvoicesTableDataSource) {
  }
}
