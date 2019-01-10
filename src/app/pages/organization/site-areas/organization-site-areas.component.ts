import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SiteAreasDataSource } from './organization-site-areas-source-table';

@Component({
  selector: 'app-organization-site-areas',
  templateUrl: 'organization-site-areas.component.html'
})
export class OrganizationSiteAreasComponent implements OnInit {

  constructor(
    public siteAreasDataSource: SiteAreasDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
  }
}
