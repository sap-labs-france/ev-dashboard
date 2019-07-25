import { Component } from '@angular/core';
import { OrganizationSitesDataSource } from './organization-sites-source-table';

@Component({
  selector: 'app-organization-sites',
  template: '<app-table [dataSource]="sitesDataSource"></app-table>',
  providers: [OrganizationSitesDataSource]
})
export class OrganizationSitesComponent {

  constructor(
    public sitesDataSource: OrganizationSitesDataSource) {
  }
}
