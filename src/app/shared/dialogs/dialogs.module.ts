import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { MaterialModule } from '../../app.module';
import { DialogService } from '../../services/dialog.service';
import { ComponentModule } from '../component/component.module';
import { ConsumptionChartComponent } from '../component/consumption-chart/consumption-chart.component';
import { ErrorCodeDetailsComponent } from '../component/error-code-details/error-code-details.component';
import { AppConnectorIdPipe } from '../formatters/app-connector-id.pipe';
import { FormattersModule } from '../formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { AssetsDialogTableDataSource } from './assets/assets-dialog-table-data-source';
import { AssetsDialogComponent } from './assets/assets-dialog.component';
import { CarCatalogsDialogTableDataSource } from './car-catalogs/car-catalogs-dialog-table-data-source';
import { CarCatalogsDialogComponent } from './car-catalogs/car-catalogs-dialog.component';
import { CarMakersTableDataSource } from './car-makers/car-makers-dialog-table-data-source';
import { CarMakersDialogComponent } from './car-makers/car-makers-dialog.component';
import { CarsDialogTableDataSource } from './cars/cars-dialog-table-data-source';
import { CarsDialogComponent } from './cars/cars-dialog.component';
import { ChargingStationsDialogTableDataSource } from './charging-stations/charging-stations-dialog-table-data-source';
import { ChargingStationsDialogComponent } from './charging-stations/charging-stations-dialog.component';
import { CompaniesDialogTableDataSource } from './companies/companies-dialog-table-data-source';
import { CompaniesDialogComponent } from './companies/companies-dialog.component';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog.component';
import { ErrorCodeDetailsDialogComponent } from './error-code-details/error-code-details-dialog.component';
import { GeoMapDialogComponent } from './geomap/geomap-dialog.component';
import { ImportDialogComponent } from './import/import-dialog.component';
import { LogActionsDialogTableDataSource } from './logs/log-actions-dialog-table-data-source';
import { LogActionsDialogComponent } from './logs/log-actions-dialog.component';
import { QrCodeDialogComponent } from './qr-code/qr-code-dialog.component';
import { ReportsDialogTableDataSource } from './reports/reports-dialog-table-data-source';
import { ReportsDialogComponent } from './reports/reports-dialog.component';
import { SiteAreasDialogTableDataSource } from './site-areas/site-areas-dialog-table-data-source';
import { SiteAreasDialogComponent } from './site-areas/site-areas-dialog.component';
import { SitesDialogTableDataSource } from './sites/sites-dialog-table-data-source';
import { SitesDialogComponent } from './sites/sites-dialog.component';
import { TagsDialogTableDataSource } from './tags/tags-dialog-table-data-source';
import { TagsDialogComponent } from './tags/tags-dialog.component';
import { TransactionDialogComponent } from './transaction/transaction-dialog.component';
import { TransactionComponent } from './transaction/transaction.component';
import { UsersDialogTableDataSource } from './users/users-dialog-table-data-source';
import { UsersDialogComponent } from './users/users-dialog.component';

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
    FileUploadModule,
  ],
  declarations: [
    CarMakersDialogComponent,
    TransactionComponent,
    TransactionDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    TagsDialogComponent,
    CarsDialogComponent,
    ConfirmationDialogComponent,
    ChargingStationsDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    GeoMapDialogComponent,
    QrCodeDialogComponent,
    ImportDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
    LogActionsDialogComponent,
  ],
  entryComponents: [
    CarMakersDialogComponent,
    TransactionComponent,
    TransactionDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    TagsDialogComponent,
    CarsDialogComponent,
    ConfirmationDialogComponent,
    ChargingStationsDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    ConsumptionChartComponent,
    GeoMapDialogComponent,
    QrCodeDialogComponent,
    ImportDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
    LogActionsDialogComponent,
  ],
  exports: [
    CarMakersDialogComponent,
    TransactionComponent,
    TransactionDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    TagsDialogComponent,
    CarsDialogComponent,
    ConfirmationDialogComponent,
    ChargingStationsDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    GeoMapDialogComponent,
    QrCodeDialogComponent,
    ImportDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
    LogActionsDialogComponent,
  ],
  providers: [
    AppConnectorIdPipe,
    DialogService,
    ChargingStationsDialogTableDataSource,
    CompaniesDialogTableDataSource,
    SiteAreasDialogTableDataSource,
    SitesDialogTableDataSource,
    AssetsDialogTableDataSource,
    UsersDialogTableDataSource,
    TagsDialogTableDataSource,
    CarsDialogTableDataSource,
    ReportsDialogTableDataSource,
    CarMakersTableDataSource,
    CarCatalogsDialogTableDataSource,
    LogActionsDialogTableDataSource,
  ],
})
export class DialogsModule {
}
