import { Component } from '@angular/core';

import { SiteAreaComponent } from '../site-area/site-area.component';
import { SiteAreasListTableDataSource } from './site-areas-list-table-data-source';

@Component({
  selector: 'app-site-areas-list',
  template: '<app-table [dataSource]="siteAreasListTableDataSource"></app-table>',
  providers: [SiteAreasListTableDataSource, SiteAreaComponent],
})
export class SiteAreasListComponent {
  constructor(
    public siteAreasListTableDataSource: SiteAreasListTableDataSource) {
  }
}
