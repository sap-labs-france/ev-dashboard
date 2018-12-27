import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule, CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
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
import {ComponentModule} from '../../shared/component/component.module';
import {ConnectorCellComponent} from '../../shared/component/connector-cell.component';
import {TransactionsInErrorComponent} from './in-error/transactions-in-error.component';
import {TransactionsInErrorDataSource} from './in-error/transactions-in-error-data-source-table';
import {ConsumptionChartComponent} from './components/consumption-chart.component';
import {ChartsModule} from 'ng2-charts';
import {ChartModule} from 'angular2-chartjs';

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
    ComponentModule,
    ChartModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInErrorComponent,
    TransactionsInProgressComponent,
    ConsumptionChartComponent
  ],
  entryComponents: [
    TransactionsComponent,
    TransactionsHistoryComponent,
    TransactionsInProgressComponent,
    TransactionsInErrorComponent,
    ConnectorCellComponent,
    ConsumptionChartComponent
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
    TransactionsInProgressDataSource
  ]
})

export class TransactionsModule {
}
