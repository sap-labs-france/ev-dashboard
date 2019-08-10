import { Component } from '@angular/core';
import { SiteAreasListTableDataSource } from './site-areas-list-table-data-source';

@Component({
  selector: 'app-site-areas-list',
  template: '<app-table [dataSource]="siteAreasListTableDataSource"></app-table>',
  providers: [SiteAreasListTableDataSource]
})
export class SiteAreasListComponent {
  constructor(
    public siteAreasListTableDataSource: SiteAreasListTableDataSource) {
  }
}
