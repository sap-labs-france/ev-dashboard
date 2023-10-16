import { Component } from '@angular/core';

import { AssetsInErrorTableDataSource } from './assets-in-error-table-data-source';

@Component({
  selector: 'app-assets-in-error',
  template: '<app-table [dataSource]="assetsInErrorTableDataSource"></app-table>',
  providers: [AssetsInErrorTableDataSource],
})
export class AssetsInErrorComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public assetsInErrorTableDataSource: AssetsInErrorTableDataSource) {}
}
