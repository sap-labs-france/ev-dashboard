import { Component, OnInit } from '@angular/core';
import { SiteAreasDataSource } from './organization-site-areas-source-table';

@Component({
  selector: 'app-organization-site-areas',
  templateUrl: 'organization-site-areas.component.html'
})
export class OrganizationSiteAreasComponent implements OnInit {

  constructor(
    public siteAreasDataSource: SiteAreasDataSource,
  ) {

  }

  ngOnInit(): void {
  }
}
