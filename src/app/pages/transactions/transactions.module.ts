import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { ErrorCodeDetailsComponent } from '../../shared/component/error-details/error-code-details.component';
import { ConsumptionChartComponent } from '../../shared/component/transaction-chart/consumption-chart.component';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AppFormatConnector, ConnectorCellComponent } from './components/connector-cell.component';
import { TransactionsHistoryDataSource } from './history/transactions-history-data-source-table';
import { TransactionsHistoryComponent } from './history/transactions-history.component';
import { TransactionsInErrorDataSource } from './in-error/transactions-in-error-data-source-table';
import { TransactionsInErrorComponent } from './in-error/transactions-in-error.component';
import { TransactionsInProgressDataSource } from './in-progress/transactions-in-progress-data-source-table';
import { TransactionsInProgressComponent } from './in-progress/transactions-in-progress.component';
import { TransactionsRefundDataSource } from './refund/transactions-refund-data-source-table';
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
    TransactionsHistoryDataSource,
    TransactionsInErrorDataSource,
    TransactionsInProgressDataSource,
    TransactionsRefundDataSource
  ]
})

export class TransactionsModule {
}
