import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MaterialModule } from '../../app.module';
import { CommonDirectivesModule } from '../directives/directives.module';
import { FormattersModule } from '../formatters/formatters.module';
import { ChartUnitSelectorComponent } from './consumption-chart/chart-unit-selector.component';
import { ConsumptionChartDetailComponent } from './consumption-chart/consumption-chart-detail.component';
import { ConsumptionChartComponent } from './consumption-chart/consumption-chart.component';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
    ChartModule,
    MaterialModule,
    FormsModule,
    NgxDaterangepickerMd,
  ],
  declarations: [
    ConsumptionChartDetailComponent,
    ConsumptionChartComponent,
    ChartUnitSelectorComponent,
  ],
  exports: [ConsumptionChartComponent, ChartUnitSelectorComponent],
})
export class ComponentModule {}
