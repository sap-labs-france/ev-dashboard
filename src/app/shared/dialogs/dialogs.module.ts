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
import {ComponentModule} from '../component/component.module';
import {ConsumptionChartComponent} from '../component/transactionChart/consumption-chart.component';
import {AppConnectorIdPipe} from '../formatters/app-connector-id.pipe';
import {FormattersModule} from '../formatters/formatters.module';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TableModule,
    TranslateModule,
    ComponentModule,
    FormattersModule,
  ],
  declarations: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SessionDialogComponent
  ],
  entryComponents: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SessionDialogComponent,
    ConsumptionChartComponent
  ],
  exports: [
    SitesDialogComponent,
    UsersDialogComponent,
    ConfirmationDialogComponent,
    ChargersDialogComponent,
    SitesFilterDialogComponent,
    SessionDialogComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    AppConnectorIdPipe
  ]
})
export class DialogsModule {
}
