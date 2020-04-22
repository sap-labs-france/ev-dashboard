import { Component } from '@angular/core';
import { SiteAreaDialogComponent } from '../site-area/site-area-dialog.component';
import { SiteAreasListTableDataSource } from './site-areas-list-table-data-source';

@Component({
  selector: 'app-site-areas-list',
  template: '<app-table [dataSource]="siteAreasListTableDataSource"></app-table>',
  providers: [SiteAreasListTableDataSource, SiteAreaDialogComponent],
})
export class SiteAreasListComponent {
  constructor(
    public siteAreasListTableDataSource: SiteAreasListTableDataSource) {
  }
}
