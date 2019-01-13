import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization-service';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { CompaniesDataSource } from './organization-companies-source-table';

@Component({
  selector: 'app-organization-companies',
  templateUrl: 'organization-companies.component.html'
})
export class OrganizationCompaniesComponent implements OnInit {

  constructor(
    public companiesDataSource: CompaniesDataSource
  ) {

  }

  ngOnInit(): void {
  }
}
