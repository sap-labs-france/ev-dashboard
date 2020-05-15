import { AgmCoreModule } from '@agm/core';
import { AppConnectorIdPipe } from '../formatters/app-connector-id.pipe';
import { AssetsDialogComponent } from './assets/assets-dialog.component';
import { AssetsDialogTableDataSource } from './assets/assets-dialog-table-data-source';
import { CarCatalogsDialogComponent } from './car-catalogs/car-catalogs-dialog.component';
import { CarCatalogsDialogTableDataSource } from './car-catalogs/car-catalogs-dialog-table-data-source';
import { CarMakersDialogComponent } from './car/car-makers-dialog.component';
import { CarMakersTableDataSource } from './car/car-makers-dialog-table-data-source';
import { ChargersDialogComponent } from './chargers/chargers-dialog.component';
import { ChargersDialogTableDataSource } from './chargers/chargers-dialog-table-data-source';
import { CommonModule } from '@angular/common';
import { CompaniesDialogComponent } from './companies/companies-dialog.component';
import { CompaniesDialogTableDataSource } from './companies/companies-dialog-table-data-source';
import { ComponentModule } from '../component/component.module';
import { ConfirmationDialogComponent } from './confirmation/confirmation-dialog.component';
import { ConsumptionChartComponent } from '../component/consumption-chart/consumption-chart.component';
import { DialogService } from '../../services/dialog.service';
import { ErrorCodeDetailsComponent } from '../component/error-code-details/error-code-details.component';
import { ErrorCodeDetailsDialogComponent } from './error-code-details/error-code-details-dialog.component';
import { FormattersModule } from '../formatters/formatters.module';
import { GeoMapDialogComponent } from './geomap/geomap-dialog.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { MaterialModule } from '../../app.module';
import { NgModule } from '@angular/core';
import { ReportsDialogComponent } from './reports/reports-dialog.component';
import { ReportsDialogTableDataSource } from './reports/reports-dialog-table-data-source';
import { RouterModule } from '@angular/router';
import { SiteAreasDialogComponent } from './site-areas/site-areas-dialog.component';
import { SiteAreasDialogTableDataSource } from './site-areas/site-areas-dialog-table-data-source';
import { SitesDialogComponent } from './sites/sites-dialog.component';
import { SitesDialogTableDataSource } from './sites/sites-dialog-table-data-source';
import { TableModule } from '../table/table.module';
import { TranslateModule } from '@ngx-translate/core';
import { UsersDialogComponent } from './users/users-dialog.component';
import { UsersDialogTableDataSource } from './users/users-dialog-table-data-source';

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
    CarMakersDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
  ],
  entryComponents: [
    CarMakersDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    ConsumptionChartComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
  ],
  exports: [
    CarMakersDialogComponent,
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SiteAreasDialogComponent,
    AssetsDialogComponent,
    CompaniesDialogComponent,
    GeoMapDialogComponent,
    ErrorCodeDetailsDialogComponent,
    ErrorCodeDetailsComponent,
    ReportsDialogComponent,
    CarCatalogsDialogComponent,
  ],
  providers: [
    AppConnectorIdPipe,
    DialogService,
    ChargersDialogTableDataSource,
    CompaniesDialogTableDataSource,
    SiteAreasDialogTableDataSource,
    SitesDialogTableDataSource,
    AssetsDialogTableDataSource,
    UsersDialogTableDataSource,
    ChargersDialogTableDataSource,
    SitesDialogTableDataSource,
    SiteAreasDialogTableDataSource,
    CompaniesDialogTableDataSource,
    ReportsDialogTableDataSource,
    CarMakersTableDataSource,
    CarCatalogsDialogTableDataSource,
  ],
})
export class DialogsModule {
}
