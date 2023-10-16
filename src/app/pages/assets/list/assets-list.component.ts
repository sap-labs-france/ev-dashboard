import { Component } from '@angular/core';

import { AssetComponent } from '../asset/asset.component';
import { AssetsListTableDataSource } from './assets-list-table-data-source';

@Component({
  selector: 'app-assets-list',
  template: '<app-table [dataSource]="assetsListTableDataSource"></app-table>',
  providers: [AssetsListTableDataSource, AssetComponent],
})
export class AssetsListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public assetsListTableDataSource: AssetsListTableDataSource) {}
}
