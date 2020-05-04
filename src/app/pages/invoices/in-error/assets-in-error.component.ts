import { Component } from '@angular/core';
import { AssetsInErrorTableDataSource } from './assets-in-error-table-data-source';

@Component({
  selector: 'app-invoices-in-error',
  template: '<app-table [dataSource]="assetsInErrorTableDataSource"></app-table>',
  providers: [AssetsInErrorTableDataSource],
})
export class InvoicesInErrorComponent {

  constructor(
    public invoicesInErrorTableDataSource: AssetsInErrorTableDataSource,
  ) {
  }
}
