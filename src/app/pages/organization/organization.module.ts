import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AddressModule } from '../../shared/address/address.module';
import { CommonModule } from '@angular/common';
import { CompaniesListComponent } from './companies/list/companies-list.component';
import { CompaniesListTableDataSource } from './companies/list/companies-list-table-data-source';
import { CompanyComponent } from './companies/company/company.component';
import { CompanyDialogComponent } from './companies/company/company.dialog.component';
import { CompanyLogoFormatterCellComponent } from './companies/cell-components/company-logo-formatter-cell.component';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { MaterialModule } from '../../app.module';
import { NgModule } from '@angular/core';
import { OrganizationComponent } from './organization.component';
import { OrganizationRoutes } from './organization.routing';
import { RouterModule } from '@angular/router';
import { SiteAreaAssetsDataSource } from './site-areas/site-area-assets/site-area-assets-table-data-source';
import { SiteAreaAssetsDialogComponent } from './site-areas/site-area-assets/site-area-assets-dialog.component';
import { SiteAreaChargingStationsDataSource } from './site-areas/site-area-charging-stations/site-area-charging-stations-table-data-source';
import { SiteAreaChargingStationsDialogComponent } from './site-areas/site-area-charging-stations/site-area-charging-stations-dialog.component';
import { SiteAreaComponent } from './site-areas/site-area/site-area.component';
import { SiteAreaConsumptionChartComponent } from './site-areas/list/consumption-chart/site-area-consumption-chart.component';
import { SiteAreaConsumptionChartDetailComponent } from './site-areas/list/consumption-chart/site-area-consumption-chart-detail.component';
import { SiteAreaDialogComponent } from './site-areas/site-area/site-area-dialog.component';
import { SiteAreasListComponent } from './site-areas/list/site-areas-list.component';
import { SiteAreasListTableDataSource } from './site-areas/list/site-areas-list-table-data-source';
import { SiteComponent } from './sites/site/site.component';
import { SiteDialogComponent } from './sites/site/site-dialog.component';
import { SiteUsersAdminCheckboxComponent } from './sites/site-users/site-users-admin-checkbox.component';
import { SiteUsersDialogComponent } from './sites/site-users/site-users-dialog.component';
import { SiteUsersOwnerRadioComponent } from './sites/site-users/site-users-owner-radio.component';
import { SiteUsersTableDataSource } from './sites/site-users/site-users-table-data-source';
import { SitesListComponent } from './sites/list/sites-list.component';
import { SitesListTableDataSource } from './sites/list/sites-list-table-data-source';
import { TableModule } from '../../shared/table/table.module';
import { TranslateModule } from '@ngx-translate/core';

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
    CompanyLogoFormatterCellComponent,
    SiteComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteDialogComponent,
    SiteUsersDialogComponent,
    SiteAreaChargingStationsDialogComponent,
    SiteAreaAssetsDialogComponent,
    SiteUsersAdminCheckboxComponent,
    SiteUsersOwnerRadioComponent,
    SiteAreaConsumptionChartComponent,
    SiteAreaConsumptionChartDetailComponent
  ],
  entryComponents: [
    OrganizationComponent,
    CompaniesListComponent,
    SitesListComponent,
    SiteAreasListComponent,
    CompanyDialogComponent,
    CompanyLogoFormatterCellComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteDialogComponent,
    SiteUsersDialogComponent,
    SiteAreaChargingStationsDialogComponent,
    SiteAreaAssetsDialogComponent,
    SiteUsersAdminCheckboxComponent,
    SiteUsersOwnerRadioComponent,
  ],
  providers: [
    CompaniesListTableDataSource,
    SiteAreasListTableDataSource,
    SiteAreaChargingStationsDataSource,
    SiteAreaAssetsDataSource,
    SitesListTableDataSource,
    SiteUsersTableDataSource,
  ],
})

export class OrganizationModule {
}
