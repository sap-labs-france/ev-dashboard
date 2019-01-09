import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {OrganizationCompaniesComponent} from './compagnies/organization-companies.component';
import {CompaniesDataSource} from './compagnies/organization-companies-source-table';
import {CompanyLogoComponent} from './formatters/company-logo.component';


import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TableModule} from '../../shared/table/table.module';
import {OrganizationComponent} from './organization.component';
import {OrganizationRoutes} from './organization.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(OrganizationRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule
  ],
  declarations: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    CompanyLogoComponent
  ],
  entryComponents: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    CompanyLogoComponent
  ],
  providers: [
    CompaniesDataSource
  ]
})

export class OrganizationModule {
}
