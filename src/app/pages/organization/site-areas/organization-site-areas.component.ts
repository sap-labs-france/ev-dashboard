import {Component} from '@angular/core';
import {OrganizationSiteAreasDataSource} from './organization-site-areas-source-table';

@Component({
  selector: 'app-organization-site-areas',
  template: '<app-table [dataSource]="siteAreasDataSource"></app-table>',
  providers: [
    OrganizationSiteAreasDataSource
  ]
})
export class OrganizationSiteAreasComponent {
  constructor(
    public siteAreasDataSource: OrganizationSiteAreasDataSource) {
  }
}
