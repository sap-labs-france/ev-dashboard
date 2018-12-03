import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, CurrencyPipe, PercentPipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {TransactionsComponent} from './transactions.component';
import {TransactionsRoutes} from './transactions.routing';
import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TableModule} from '../../shared/table/table.module';
import {TransactionsHistoryComponent} from './history/transactions-history.component';
import {TransactionsInProgressComponent} from './in-progress/transactions-in-progress.component';
import {CommonDirectivesModule} from '../../shared/directives/common-directives.module';
import {FormattersModule} from '../../shared/formatters/formatters.module';
import {TransactionsHistoryDataSource} from './history/transactions-history-data-source-table';
import {TransactionsInProgressDataSource} from './in-progress/transactions-in-progress-data-source-table';
import {ConnectorCellComponent} from './in-progress/components/connector-cell.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TransactionsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule,
    FormattersModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInProgressComponent,
    ConnectorCellComponent
  ],
  entryComponents: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInProgressComponent,
    ConnectorCellComponent
  ],
  exports: [
    TransactionsComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    TransactionsHistoryDataSource,
    TransactionsInProgressDataSource,
    ConnectorCellComponent
  ]
})

export class TransactionsModule {
}
