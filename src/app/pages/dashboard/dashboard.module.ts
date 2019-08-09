import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';

import { AgmCoreModule } from '@agm/core';
import { ChartModule } from 'angular2-chartjs';
import { ComponentModule } from 'app/shared/component/component.module';
import { GaugesModule } from 'app/shared/component/gauge/gauge.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
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
    GaugesModule,
    AgmCoreModule,
    ChartModule,
    FormattersModule
  ],
  declarations: [
    DashboardComponent,
    ChargingStationConsumptionGaugeComponent,
    ChargingStationGaugeComponent,
    CardChartComponent,
    CardKeyfigureComponent
  ],
  exports: [
    ChargingStationConsumptionGaugeComponent,
    ChargingStationGaugeComponent,
    CardChartComponent,
    CardKeyfigureComponent
  ]
})

export class DashboardModule {
}
