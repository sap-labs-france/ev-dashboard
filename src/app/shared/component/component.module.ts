import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';

import { CommonDirectivesModule } from '../directives/directives.module';
import { FormattersModule } from '../formatters/formatters.module';
import { ChartUnitSelectorComponent } from './consumption-chart/chart-unit-selector.component';
import { ConsumptionChartDetailComponent } from './consumption-chart/consumption-chart-detail.component';
import { ConsumptionChartComponent } from './consumption-chart/consumption-chart.component';
import { GaugesModule } from './gauge/gauge.module';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
    ChartModule,
    GaugesModule,
    MaterialModule,
  ],
  declarations: [
    ConsumptionChartDetailComponent,
    ConsumptionChartComponent,
    ChartUnitSelectorComponent
  ],
  exports: [
    ConsumptionChartComponent,
    ChartUnitSelectorComponent
  ],
  entryComponents: [
    ConsumptionChartDetailComponent,
  ],
})
export class ComponentModule {
}
