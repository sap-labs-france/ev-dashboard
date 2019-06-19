import { AgmCoreModule } from '@agm/core';
import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MaterialModule } from '../../app.module';
import { DialogService } from '../../services/dialog.service';
import { ComponentModule } from '../component/component.module';
import { ErrorCodeDetailsComponent } from '../component/error-details/error-code-details.component';
import { ConsumptionChartComponent } from '../component/transaction-chart/consumption-chart.component';
import { AppConnectorIdPipe } from '../formatters/app-connector-id.pipe';
import { FormattersModule } from '../formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { ChargersDataSource } from './chargers/chargers-data-source-table';
import { ChargersDialogComponent } from './chargers/chargers-dialog-component';
import { CompaniesFilterDataSource } from './companies/companies-filter-data-source-table';
import { CompaniesFilterDialogComponent } from './companies/companies-filter-dialog-component';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog-component';
import { ErrorCodeDetailsDialogComponent } from './error-details/error-code-details-dialog.component';
import { GeoMapDialogComponent } from './geomap/geomap-dialog-component';
import { SessionDialogComponent } from './session/session-dialog-component';
import { SiteAreasDialogComponent } from './site-areas/site-areas-dialog-component';
import { SiteAreasFilterDataSourceTable } from './site-areas/site-areas-filter-data-source-table';
import { SiteAreasFilterDialogComponent } from './site-areas/site-areas-filter-dialog.component';
import { SitesDataSource } from './sites/sites-data-source-table';
import { SitesDialogComponent } from './sites/sites-dialog-component';
import { SitesFilterDataSource } from './sites/sites-filter-data-source-table';
import { SitesFilterDialogComponent } from './sites/sites-filter-dialog-component';
import { UsersDataSource } from './users/users-data-source-table';
import { UsersDialogComponent } from './users/users-dialog-component';

export class FooterModule {
}


@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TableModule,
    TranslateModule,
    ComponentModule,
    FormattersModule,
    AgmCoreModule,
    GooglePlaceModule
  ],
  declarations: [
    SitesDialogComponent,
    SiteAreasDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SiteAreasFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent
  ],
  entryComponents: [
    SitesDialogComponent,
    SiteAreasDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SiteAreasFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    ConsumptionChartComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent
  ],
  exports: [
    SitesDialogComponent,
    SiteAreasDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SiteAreasFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    AppConnectorIdPipe,
    DialogService,
    ChargersDataSource,
    CompaniesFilterDataSource,
    SiteAreasFilterDataSourceTable,
    SitesDataSource,
    SitesFilterDataSource,
    UsersDataSource
  ]
})
export class DialogsModule {
}
