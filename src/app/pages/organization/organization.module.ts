import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';

import { AddressModule } from '../../shared/address/address.module';
import { CompanyComponent } from './companies/company/company.component';
import { CompanyDialogComponent } from './companies/company/company.dialog.component';
import { OrganizationCompaniesComponent } from './companies/organization-companies.component';
import { CompanyLogoComponent } from './formatters/company-logo.component';
import { OrganizationSiteAreasComponent } from './site-areas/organization-site-areas.component';
import { SiteAreaChargersDialogComponent } from './site-areas/site-area/site-area-chargers/site-area-chargers.dialog.component';
import { SiteAreaComponent } from './site-areas/site-area/site-area.component';
import { SiteAreaDialogComponent } from './site-areas/site-area/site-area.dialog.component';
import { OrganizationSitesComponent } from './sites/organization-sites.component';
import { SiteUsersDialogComponent } from './sites/site/site-users/site-users.dialog.component';
import { SiteComponent } from './sites/site/site.component';
import { SiteDialogComponent } from './sites/site/site.dialog.component';

import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { OrganizationCompaniesDataSource } from './companies/organization-companies-source-table';
import { OrganizationComponent } from './organization.component';
import { OrganizationRoutes } from './organization.routing';
import { OrganizationSiteAreasDataSource } from './site-areas/organization-site-areas-source-table';
import { SiteAreaChargersDataSource } from './site-areas/site-area/site-area-chargers/site-area-chargers-data-source-table';
import { OrganizationSitesDataSource } from './sites/organization-sites-source-table';
import { SiteAdminCheckboxComponent } from './sites/site/site-users/site-admin-checkbox.component';
import { SiteUsersDataSource } from './sites/site/site-users/site-users-data-source-table';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AddressModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    RouterModule.forChild(OrganizationRoutes),
  ],
  declarations: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    OrganizationSitesComponent,
    OrganizationSiteAreasComponent,
    CompanyComponent,
    CompanyDialogComponent,
    CompanyLogoComponent,
    SiteComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteDialogComponent,
    SiteUsersDialogComponent,
    SiteAreaChargersDialogComponent,
    SiteAdminCheckboxComponent
  ],
  entryComponents: [
    OrganizationComponent,
    OrganizationCompaniesComponent,
    OrganizationSitesComponent,
    OrganizationSiteAreasComponent,
    CompanyDialogComponent,
    CompanyLogoComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteDialogComponent,
    SiteUsersDialogComponent,
    SiteAreaChargersDialogComponent,
    SiteAdminCheckboxComponent
  ],
  providers: [
    OrganizationCompaniesDataSource,
    OrganizationSiteAreasDataSource,
    SiteAreaChargersDataSource,
    OrganizationSitesDataSource,
    SiteUsersDataSource
  ]
})

export class OrganizationModule {
}
