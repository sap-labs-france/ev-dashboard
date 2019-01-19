import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SitesDataSource } from './organization-sites-source-table';

@Component({
  selector: 'app-organization-sites',
  templateUrl: 'organization-sites.component.html'
})
export class OrganizationSitesComponent implements OnInit {

  constructor(
    public sitesDataSource: SitesDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
  }
}
