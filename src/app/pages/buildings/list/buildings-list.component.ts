import { Component } from '@angular/core';
import { BuildingsListTableDataSource } from './buildings-list-table-data-source';

@Component({
  selector: 'app-buildings-list',
  template: '<app-table [dataSource]="buildingsListTableDataSource"></app-table>',
  providers: [BuildingsListTableDataSource],
})
export class BuildingsListComponent {

  constructor(
    public buildingsListTableDataSource: BuildingsListTableDataSource,
    ) {
  }
}
