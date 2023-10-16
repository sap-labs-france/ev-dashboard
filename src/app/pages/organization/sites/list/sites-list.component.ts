import { Component } from '@angular/core';

import { SiteComponent } from '../site/site.component';
import { SitesListTableDataSource } from './sites-list-table-data-source';

@Component({
  selector: 'app-sites-list',
  template: '<app-table [dataSource]="sitesListTableDataSource"></app-table>',
  providers: [SitesListTableDataSource, SiteComponent],
})
export class SitesListComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(public sitesListTableDataSource: SitesListTableDataSource) {}
}
