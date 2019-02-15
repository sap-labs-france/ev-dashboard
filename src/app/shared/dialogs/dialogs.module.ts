import {SessionDialogComponent} from './session/session-dialog-component';

export class FooterModule {
}

import {NgModule} from '@angular/core';
import {CommonModule, CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';
import {SitesDialogComponent} from './sites/sites-dialog-component';
import {ConfirmationDialogComponent} from './confirmation/confirmation-dialog-component';
import {TableModule} from '../table/table.module';
import {UsersDialogComponent} from './users/users-dialog-component';
import {ChargersDialogComponent} from './chargers/chargers-dialog-component';
import {SitesFilterDialogComponent} from './sites/sites-filter-dialog-component';
import {CompaniesFilterDialogComponent} from './companies/companies-filter-dialog-component';
import {ComponentModule} from '../component/component.module';
import {ConsumptionChartComponent} from '../component/transactionChart/consumption-chart.component';
import {AppConnectorIdPipe} from '../formatters/app-connector-id.pipe';
import {FormattersModule} from '../formatters/formatters.module';
import {UsersDataSource} from './users/users-data-source-table';
import {ChargersDataSource} from './chargers/chargers-data-source-table';
import {ChargerErrorCodeDetailsDialogComponent} from './chargers/charger-error-code-details-dialog-component';
import {GeoMapDialogComponent} from './geomap/geomap-dialog-component';
import {AgmCoreModule} from '@agm/core';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';


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
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    ChargerErrorCodeDetailsDialogComponent,
    GeoMapDialogComponent
  ],
  entryComponents: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    ConsumptionChartComponent,
    ChargerErrorCodeDetailsDialogComponent,
    GeoMapDialogComponent
  ],
  exports: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    CompaniesFilterDialogComponent,
    SessionDialogComponent,
    ChargerErrorCodeDetailsDialogComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    AppConnectorIdPipe,
    UsersDataSource,
    ChargersDataSource
  ]
})
export class DialogsModule {
}
