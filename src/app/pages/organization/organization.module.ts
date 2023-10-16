import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccountBillingComponent } from 'shared/component/account-billing/account-billing.component';
import { PricingDefinitionsModule } from 'shared/pricing-definitions/pricing-definitions.module';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { CompanyLogoFormatterCellComponent } from './companies/cell-components/company-logo-formatter-cell.component';
import { CompanyDialogComponent } from './companies/company/company-dialog.component';
import { CompanyComponent } from './companies/company/company.component';
import { CompanyMainComponent } from './companies/company/main/company-main.component';
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
import { SiteAreaLimitsComponent } from './site-areas/site-area/limits/site-area-limits.component';
import { SiteAreaMainComponent } from './site-areas/site-area/main/site-area-main.component';
import { SiteAreaOcpiComponent } from './site-areas/site-area/ocpi/site-area-ocpi.component';
import { SiteAreaDialogComponent } from './site-areas/site-area/site-area-dialog.component';
import { SiteAreaComponent } from './site-areas/site-area/site-area.component';
import { SitesListTableDataSource } from './sites/list/sites-list-table-data-source';
import { SitesListComponent } from './sites/list/sites-list.component';
import { SiteUsersDialogComponent } from './sites/site-users/site-users-dialog.component';
import { SiteUsersSiteAdminComponent } from './sites/site-users/site-users-site-admin.component';
import { SiteUsersSiteOwnerComponent } from './sites/site-users/site-users-site-owner.component';
import { SiteUsersTableDataSource } from './sites/site-users/site-users-table-data-source';
import { SiteMainComponent } from './sites/site/main/site-main.component';
import { SiteOcpiComponent } from './sites/site/ocpi/site-ocpi.component';
import { SiteDialogComponent } from './sites/site/site-dialog.component';
import { SiteComponent } from './sites/site/site.component';

@NgModule({
  imports: [
    AddressModule,
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
    PricingDefinitionsModule,
  ],
  declarations: [
    OrganizationComponent,
    CompaniesListComponent,
    SitesListComponent,
    SiteAreasListComponent,
    CompanyComponent,
    CompanyMainComponent,
    AccountBillingComponent,
    CompanyDialogComponent,
    CompanyLogoFormatterCellComponent,
    SiteComponent,
    SiteAreaDialogComponent,
    SiteAreaComponent,
    SiteDialogComponent,
    SiteUsersDialogComponent,
    SiteAreaChargingStationsDialogComponent,
    SiteAreaAssetsDialogComponent,
    SiteMainComponent,
    SiteAreaLimitsComponent,
    SiteOcpiComponent,
    SiteAreaMainComponent,
    SiteAreaOcpiComponent,
    SiteUsersSiteAdminComponent,
    SiteUsersSiteOwnerComponent,
    SiteAreaConsumptionChartComponent,
    SiteAreaConsumptionChartDetailComponent,
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
export class OrganizationModule {}
