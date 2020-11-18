import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { CompanyLogoFormatterCellComponent } from './companies/cell-components/company-logo-formatter-cell.component';
import { CompanyComponent } from './companies/company/company.component';
import { CompanyDialogComponent } from './companies/company/company.dialog.component';
import { CompaniesListTableDataSource } from './companies/list/companies-list-table-data-source';
import { CompaniesListComponent } from './companies/list/companies-list.component';
import { OrganizationComponent } from './organization.component';
import { OrganizationRoutes } from './organization.routing';
import { SiteAreaConsumptionChartDetailComponent } from './site-areas/list/consumption-chart/site-area-consumption-chart-detail.component';
import { SiteAreaConsumptionChartComponent } from './site-areas/list/consumption-chart/site-area-consumption-chart.component';
import { SiteAreasListTableDataSource } from './site-areas/list/site-areas-list-table-data-source';
import { SiteAreasListComponent } from './site-areas/list/site-areas-list.component';
import { SiteAreaAssetsDialogComponent } from './site-areas/site-area-assets/site-area-assets-dialog.component';
import { SiteAreaAssetsDataSource } from './site-areas/site-area-assets/site-area-assets-table-data-source';
import { SiteAreaChargingStationsDialogComponent } from './site-areas/site-area-charging-stations/site-area-charging-stations-dialog.component';
import { SiteAreaChargingStationsDataSource } from './site-areas/site-area-charging-stations/site-area-charging-stations-table-data-source';
import { SiteAreaDialogComponent } from './site-areas/site-area/site-area-dialog.component';
import { SiteAreaComponent } from './site-areas/site-area/site-area.component';
import { SitesListTableDataSource } from './sites/list/sites-list-table-data-source';
import { SitesListComponent } from './sites/list/sites-list.component';
import { SiteUsersAdminCheckboxComponent } from './sites/site-users/site-users-admin-checkbox.component';
import { SiteUsersDialogComponent } from './sites/site-users/site-users-dialog.component';
import { SiteUsersOwnerRadioComponent } from './sites/site-users/site-users-owner-radio.component';
import { SiteUsersTableDataSource } from './sites/site-users/site-users-table-data-source';
import { SiteDialogComponent } from './sites/site/site-dialog.component';
import { SiteComponent } from './sites/site/site.component';

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
    ComponentModule,
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
