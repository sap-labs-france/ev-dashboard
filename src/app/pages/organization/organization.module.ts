import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {OrganizationCompaniesComponent} from './companies/organization-companies.component';
import {CompaniesDataSource} from './companies/organization-companies-source-table';
import {AddressModule} from '../../shared/address/address.module';
import {OrganizationSitesComponent} from './sites/organization-sites.component';
import {SitesDataSource} from './sites/organization-sites-source-table';
import {OrganizationSiteAreasComponent} from './site-areas/organization-site-areas.component';
import {SiteAreasDataSource} from './site-areas/organization-site-areas-source-table';
import {CompanyLogoComponent} from './formatters/company-logo.component';
import {CompanyDialogComponent} from './companies/company/company.dialog.component';
import {CompanyComponent} from './companies/company/company.component';
import {SiteDialogComponent} from './sites/site/site.dialog.component';
import {SiteComponent} from './sites/site/site.component';
import {SiteAreaDialogComponent} from './site-areas/site-area/site-area.dialog.component';
import {SiteAreaComponent} from './site-areas/site-area/site-area.component';
import {SiteUsersDialogComponent} from './sites/site/site-users/site-users.dialog.component';
import {SiteUsersDataSource} from './sites/site/site-users/site-users-data-source-table';
import {SiteAreaChargersDialogComponent} from './site-areas/site-area/site-area-chargers/site-area-chargers.dialog.component';
import {SiteAreaChargersDataSource} from './site-areas/site-area/site-area-chargers/site-area-chargers-data-source-table';


import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TableModule} from '../../shared/table/table.module';
import {OrganizationComponent} from './organization.component';
import {OrganizationRoutes} from './organization.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(OrganizationRoutes),
    FormsModule,
    AddressModule,
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
    CompanyLogoComponent,
    SiteDialogComponent,
    SiteComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteUsersDialogComponent,
    SiteAreaChargersDialogComponent
  ],
  entryComponents: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    OrganizationSitesComponent,
    OrganizationSiteAreasComponent,
    CompanyDialogComponent,
    CompanyLogoComponent,
    SiteDialogComponent,
    SiteComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteUsersDialogComponent,
    SiteAreaChargersDialogComponent
  ],
  providers: [
    CompaniesDataSource,
    SitesDataSource,
    SiteAreasDataSource,
    SiteUsersDataSource,
    SiteAreaChargersDataSource
  ]
})

export class OrganizationModule {
}
