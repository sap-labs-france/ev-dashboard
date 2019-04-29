import {NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule, CurrencyPipe, DecimalPipe, PercentPipe} from '@angular/common';
import {FormattersModule} from '../formatters/formatters.module';
import {CommonDirectivesModule} from '../directives/common-directives.module';
import {ConsumptionChartComponent} from './transaction-chart/consumption-chart.component';
import {ConsumptionChartDetailComponent} from './transaction-chart/consumption-chart-detail.component';

import {ChartModule} from 'angular2-chartjs';
import {GaugesModule} from './gauge/gauge.module';
import {MaterialModule} from 'app/app.module';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
    ChartModule,
    GaugesModule,
    MaterialModule
  ],
  declarations: [
    ConsumptionChartDetailComponent,
    ConsumptionChartComponent
  ],
  exports: [
    ConsumptionChartComponent
  ],
  entryComponents: [
    ConsumptionChartDetailComponent
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe
  ]
})
export class ComponentModule {
}
