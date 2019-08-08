import { Component } from '@angular/core';
import { SitesListTableDataSource } from './sites-list-table-data-source';

@Component({
  selector: 'app-sites-list',
  template: '<app-table [dataSource]="sitesListTableDataSource"></app-table>',
  providers: [SitesListTableDataSource]
})
export class SitesListComponent {

  constructor(
    public sitesListTableDataSource: SitesListTableDataSource) {
  }
}
