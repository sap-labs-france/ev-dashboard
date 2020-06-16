import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { CommonDirectivesModule } from '../directives/directives.module';
import { FormattersModule } from '../formatters/formatters.module';
import { ChartUnitSelectorComponent } from './consumption-chart/chart-unit-selector.component';
import { ConsumptionChartDetailComponent } from './consumption-chart/consumption-chart-detail.component';
import { ConsumptionChartComponent } from './consumption-chart/consumption-chart.component';
import { DateRangeComponent } from './date-range/date-range.component';
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
    NgxDaterangepickerMd,
  ],
  declarations: [
    ConsumptionChartDetailComponent,
    ConsumptionChartComponent,
    ChartUnitSelectorComponent,
    DateRangeComponent
  ],
  exports: [
    ConsumptionChartComponent,
    ChartUnitSelectorComponent,
    DateRangeComponent
  ],
  entryComponents: [
    ConsumptionChartDetailComponent,
  ],
})
export class ComponentModule {
}
