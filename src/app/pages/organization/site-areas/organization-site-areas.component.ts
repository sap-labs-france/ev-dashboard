import {Component, OnInit} from '@angular/core';
import {OrganizationSiteAreasDataSource} from './organization-site-areas-source-table';

@Component({
  selector: 'app-organization-site-areas',
  templateUrl: 'organization-site-areas.component.html',
  providers: [
    OrganizationSiteAreasDataSource
  ]
})
export class OrganizationSiteAreasComponent implements OnInit {

  constructor(
    public siteAreasDataSource: OrganizationSiteAreasDataSource,
  ) {

  }

  ngOnInit(): void {
  }
}
