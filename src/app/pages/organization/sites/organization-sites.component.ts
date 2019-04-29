import {Component} from '@angular/core';
import {OrganizationSitesDataSource} from './organization-sites-source-table';

@Component({
  selector: 'app-organization-sites',
  templateUrl: 'organization-sites.component.html',
  providers: [
    OrganizationSitesDataSource
  ]
})
export class OrganizationSitesComponent {

  constructor(
    public sitesDataSource: OrganizationSitesDataSource) {
  }
}
