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
  public isAdmin;
  public formGroup: FormGroup;
  public name: AbstractControl;
  public country_code: AbstractControl;
  public party_id: AbstractControl;
  private readonly currentBusinessDetails: any;

  constructor(
    public companiesDataSource: CompaniesDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService
  ) {

  }

  ngOnInit(): void {
  }
}
