import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';

import { AddressModule } from '../../shared/address/address.module';
import { CompanyComponent } from './companies/company/company.component';
import { CompanyDialogComponent } from './companies/company/company.dialog.component';
import { CompaniesListComponent } from './companies/list/companies-list.component';
import { CompanyLogoComponent } from './formatters/company-logo.component';
import { SiteAreasListComponent } from './site-areas/list/site-areas-list.component';
import { SiteAreaChargersDialogComponent } from './site-areas/site-area-chargers/site-area-chargers-dialog.component';
import { SiteAreaComponent } from './site-areas/site-area/site-area.component';
import { SiteAreaDialogComponent } from './site-areas/site-area/site-area-dialog.component';
import { SitesListComponent } from './sites/list/sites-list.component';
import { SiteUsersDialogComponent } from './sites/site-users/site-users-dialog.component';
import { SiteComponent } from './sites/site/site.component';
import { SiteDialogComponent } from './sites/site/site-dialog.component';

import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { CompaniesListTableDataSource } from './companies/list/companies-list-table-data-source';
import { OrganizationComponent } from './organization.component';
import { OrganizationRoutes } from './organization.routing';
import { SiteAreasListTableDataSource } from './site-areas/list/site-areas-list-table-data-source';
import { SiteAreaChargersDataSource } from './site-areas/site-area-chargers/site-area-chargers-table-data-source';
import { SitesListTableDataSource } from './sites/list/sites-list-table-data-source';
import { SiteAdminCheckboxComponent } from './sites/site-users/site-users-admin-checkbox.component';
import { SiteUsersTableDataSource } from './sites/site-users/site-users-table-data-source';

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
    CompaniesListComponent,
    SitesListComponent,
    SiteAreasListComponent,
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
    CompaniesListComponent,
    SitesListComponent,
    SiteAreasListComponent,
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
    CompaniesListTableDataSource,
    SiteAreasListTableDataSource,
    SiteAreaChargersDataSource,
    SitesListTableDataSource,
    SiteUsersTableDataSource
  ]
})

export class OrganizationModule {
}
