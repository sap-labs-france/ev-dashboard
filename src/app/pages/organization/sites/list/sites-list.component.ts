import { Component } from '@angular/core';
import { SiteDialogComponent } from '../site/site-dialog.component';
import { SitesListTableDataSource } from './sites-list-table-data-source';

@Component({
  selector: 'app-sites-list',
  template: '<app-table [dataSource]="sitesListTableDataSource"></app-table>',
  providers: [SitesListTableDataSource, SiteDialogComponent],
})
export class SitesListComponent {

  constructor(
    public sitesListTableDataSource: SitesListTableDataSource) {
  }
}
