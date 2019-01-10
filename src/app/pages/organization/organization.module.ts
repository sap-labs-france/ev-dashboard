import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {OrganizationCompaniesComponent} from './companies/organization-companies.component';
import {CompaniesDataSource} from './companies/organization-companies-source-table';
import {OrganizationSitesComponent} from './sites/organization-sites.component';
import {SitesDataSource} from './sites/organization-sites-source-table';
import {OrganizationSiteAreasComponent} from './site-areas/organization-site-areas.component';
import {SiteAreasDataSource} from './site-areas/organization-site-areas-source-table';
import {CompanyLogoComponent} from './formatters/company-logo.component';
import {CompanyDialogComponent} from './companies/company/company.dialog.component';
import {CompanyComponent} from './companies/company/company.component';


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
    OrganizationSitesComponent,
    OrganizationSiteAreasComponent,
    CompanyComponent,
    CompanyDialogComponent,
    CompanyLogoComponent
  ],
  entryComponents: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    OrganizationSitesComponent,
    OrganizationSiteAreasComponent,
    CompanyDialogComponent,
    CompanyLogoComponent
  ],
  providers: [
    CompaniesDataSource,
    SitesDataSource,
    SiteAreasDataSource
  ]
})

export class OrganizationModule {
}
