import { Component } from '@angular/core';
import { InvoicesTableDataSource } from './invoices-table-data-source';

@Component({
  selector: 'app-invoices',
  template: '<app-table [dataSource]="invoicesTableDataSource"></app-table>',
  providers: [InvoicesTableDataSource],
})
export class InvoicesComponent {
  constructor(public invoicesTableDataSource: InvoicesTableDataSource) {
  }
}
