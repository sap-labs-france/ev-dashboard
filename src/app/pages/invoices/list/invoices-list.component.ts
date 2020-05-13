import { Component } from '@angular/core';

import { InvoicesComponent } from '../invoices.component';
import { InvoicesTableDataSource } from './invoices-table-data-source';

@Component({
  selector: 'app-invoices-list',
  template: '<app-table [dataSource]="invoicesListTableDataSource"></app-table>',
  providers: [InvoicesTableDataSource, InvoicesComponent],
})
export class InvoicesListComponent {

  constructor(
    public invoicesListTableDataSource: InvoicesTableDataSource,
    ) {
  }
}
