import {NgModule} from '@angular/core';
import {ChipComponent} from './chip/chip.component';
import {MatChipsModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule, CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {FormattersModule} from '../formatters/formatters.module';
import {ConnectorCellComponent} from './connector-cell.component';
import {CommonDirectivesModule} from '../directives/common-directives.module';
import {ConsumptionChartComponent} from './transactionChart/consumption-chart.component';
import {ChartModule} from 'angular2-chartjs';
import {TransactionsHistoryDataSource} from '../../pages/transactions/history/transactions-history-data-source-table';
import {TransactionsInErrorDataSource} from '../../pages/transactions/in-error/transactions-in-error-data-source-table';
import {TransactionsInProgressDataSource} from '../../pages/transactions/in-progress/transactions-in-progress-data-source-table';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
    ChartModule
  ],
  declarations: [
    ChipComponent,
    ConnectorCellComponent,
    ConsumptionChartComponent
  ],
  exports: [
    ChipComponent,
    ConnectorCellComponent,
    ConsumptionChartComponent
  ],
  entryComponents: [
    ConnectorCellComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe
  ]
})
export class ComponentModule {
}
