import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { CardChartComponent } from './card-chart/card-chart.component';
import { CardKeyfigureComponent } from './card-keyfigure/card-keyfigure.component';
import { ChargingStationConsumptionGaugeComponent } from './dashboard-components/charging-station-consumption-gauge.component';
import { ChargingStationGaugeComponent } from './dashboard-components/charging-station-gauge.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutes } from './dashboard.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(DashboardRoutes),
    TranslateModule,
    MaterialModule,
    ComponentModule,
    AgmCoreModule,
    ChartModule,
    FormattersModule,
  ],
  declarations: [
    DashboardComponent,
    ChargingStationConsumptionGaugeComponent,
    ChargingStationGaugeComponent,
    CardChartComponent,
    CardKeyfigureComponent,
  ],
  exports: [
    ChargingStationConsumptionGaugeComponent,
    ChargingStationGaugeComponent,
    CardChartComponent,
    CardKeyfigureComponent,
  ],
})

export class DashboardModule {
}
