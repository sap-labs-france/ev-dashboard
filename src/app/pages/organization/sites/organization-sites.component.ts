import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AuthorizationService} from 'app/services/authorization-service';
import {OrganizationSitesDataSource} from './organization-sites-source-table';

@Component({
  selector: 'app-organization-sites',
  templateUrl: 'organization-sites.component.html',
  providers: [
    OrganizationSitesDataSource
  ]
})
export class OrganizationSitesComponent implements OnInit {

  constructor(
    public sitesDataSource: OrganizationSitesDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
  }
}
