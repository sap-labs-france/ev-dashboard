import {SessionDialogComponent} from './session/session-dialog-component';
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
import {ChargersDataSource} from './chargers/chargers-data-source-table';
import {GeoMapDialogComponent} from './geomap/geomap-dialog-component';
import {AgmCoreModule} from '@agm/core';
import {GooglePlaceModule} from 'ngx-google-places-autocomplete';
import {SiteAreasDialogComponent} from './sites/site-areas-dialog-component';
import {SiteAreasFilterDialogComponent} from './sites/site-areas-filter-dialog.component';
import {ErrorCodeDetailsDialogComponent} from './error-details/error-code-details-dialog.component';
import {ErrorCodeDetailsComponent} from '../component/error-details/error-code-details.component';

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
    ChargersDataSource
  ]
})
export class DialogsModule {
}
