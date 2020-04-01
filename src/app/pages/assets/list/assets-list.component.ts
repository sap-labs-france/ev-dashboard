import { Component } from '@angular/core';
import { AssetsListTableDataSource } from './assets-list-table-data-source';

@Component({
  selector: 'app-assets-list',
  template: '<app-table [dataSource]="assetsListTableDataSource"></app-table>',
  providers: [AssetsListTableDataSource],
})
export class AssetsListComponent {

  constructor(
    public assetsListTableDataSource: AssetsListTableDataSource,
    ) {
  }
}
