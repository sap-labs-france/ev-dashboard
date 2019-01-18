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
import {TransactionsHistoryDataSource} from '../../pages/transactions/history/transactions-history-data-source-table';
import {TransactionsInErrorDataSource} from '../../pages/transactions/in-error/transactions-in-error-data-source-table';
import {TransactionsInProgressDataSource} from '../../pages/transactions/in-progress/transactions-in-progress-data-source-table';
import {AppConnectorIdPipe} from '../formatters/app-connector-id.pipe';
import {FormattersModule} from '../formatters/formatters.module';
import {UsersDataSource} from './users/users-data-source-table';
import {ChargersDataSource} from './chargers/chargers-data-source-table';

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
    AppConnectorIdPipe,
    UsersDataSource,
    ChargersDataSource
  ]
})
export class DialogsModule {
}
