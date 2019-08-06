import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { ErrorCodeDetailsComponent } from '../../shared/component/error-code-details/error-code-details.component';
import { ConsumptionChartComponent } from '../../shared/component/consumption-chart/consumption-chart.component';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AppFormatConnector, ConnectorCellComponent } from './components/connector-cell.component';
import { TransactionsHistoryTableDataSource } from './history/transactions-history-table-data-source';
import { TransactionsHistoryComponent } from './history/transactions-history.component';
import { TransactionsInErrorTableDataSource } from './in-error/transactions-in-error-table-data-source';
import { TransactionsInErrorComponent } from './in-error/transactions-in-error.component';
import { TransactionsInProgressTableDataSource } from './in-progress/transactions-in-progress-table-data-source';
import { TransactionsInProgressComponent } from './in-progress/transactions-in-progress.component';
import { TransactionsRefundTableDataSource } from './refund/transactions-refund-table-data-source';
import { TransactionsRefundComponent } from './refund/transactions-refund.component';
import { TransactionsComponent } from './transactions.component';
import { TransactionsRoutes } from './transactions.routing';

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
    FormattersModule,
    ComponentModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInErrorComponent,
    TransactionsInProgressComponent,
    TransactionsRefundComponent,
    AppFormatConnector,
    ConnectorCellComponent,
  ],
  entryComponents: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInProgressComponent,
    TransactionsInErrorComponent,
    TransactionsRefundComponent,
    ConnectorCellComponent,
    ConsumptionChartComponent,
    ErrorCodeDetailsComponent
  ],
  exports: [
    TransactionsComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
    TransactionsHistoryTableDataSource,
    TransactionsInErrorTableDataSource,
    TransactionsInProgressTableDataSource,
    TransactionsRefundTableDataSource
  ]
})

export class TransactionsModule {
}
