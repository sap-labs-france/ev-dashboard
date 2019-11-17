import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MaterialModule } from '../../app.module';
import { DialogService } from '../../services/dialog.service';
import { ComponentModule } from '../component/component.module';
import { ConsumptionChartComponent } from '../component/consumption-chart/consumption-chart.component';
import { ErrorCodeDetailsComponent } from '../component/error-code-details/error-code-details.component';
import { AppConnectorIdPipe } from '../formatters/app-connector-id.pipe';
import { FormattersModule } from '../formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { ChargersDialogTableDataSource } from './chargers/chargers-dialog-table-data-source';
import { ChargersDialogComponent } from './chargers/chargers-dialog.component';
import { CompaniesDialogTableDataSource } from './companies/companies-dialog-table-data-source';
import { CompaniesDialogComponent } from './companies/companies-dialog.component';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog.component';
import { ErrorCodeDetailsDialogComponent } from './error-code-details/error-code-details-dialog.component';
import { GeoMapDialogComponent } from './geomap/geomap-dialog.component';
import { SiteAreasDialogTableDataSource } from './site-areas/site-areas-dialog-table-data-source';
import { SiteAreasDialogComponent } from './site-areas/site-areas-dialog.component';
import { SitesDialogTableDataSource } from './sites/sites-dialog-table-data-source';
import { SitesDialogComponent } from './sites/sites-dialog.component';
import { TransactionDialogComponent } from './transaction/transaction-dialog.component';
import { UsersDialogTableDataSource } from './users/users-dialog-table-data-source';
import { UsersDialogComponent } from './users/users-dialog.component';

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
    GooglePlaceModule,
  ],
  declarations: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    CompaniesDialogComponent,
    TransactionDialogComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
  ],
  entryComponents: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    CompaniesDialogComponent,
    TransactionDialogComponent,
    ConsumptionChartComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
  ],
  exports: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    CompaniesDialogComponent,
    TransactionDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
  ],
  providers: [
    AppConnectorIdPipe,
    DialogService,
    ChargersDialogTableDataSource,
    CompaniesDialogTableDataSource,
    SiteAreasDialogTableDataSource,
    SitesDialogTableDataSource,
    UsersDialogTableDataSource,
    ChargersDialogTableDataSource,
    SitesDialogTableDataSource,
    SiteAreasDialogTableDataSource,
    CompaniesDialogTableDataSource,
  ],
})
export class DialogsModule {
}
