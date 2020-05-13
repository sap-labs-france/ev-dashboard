import { Component } from '@angular/core';

import { AssetsInErrorTableDataSource } from './assets-in-error-table-data-source';

@Component({
  selector: 'app-assets-in-error',
  template: '<app-table [dataSource]="assetsInErrorTableDataSource"></app-table>',
  providers: [AssetsInErrorTableDataSource],
})
export class AssetsInErrorComponent {

  constructor(
    public assetsInErrorTableDataSource: AssetsInErrorTableDataSource,
  ) {
  }
}
