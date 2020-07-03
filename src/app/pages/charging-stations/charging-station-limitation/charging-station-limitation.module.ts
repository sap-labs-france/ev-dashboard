import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { ChargingStationPowerSliderCellComponent } from './cell-components/charging-station-power-slider-cell.component';
import { ChargingPlanChartComponent } from './charging-plans/charging-plan-chart.component';
import { ChargingPlansComponent } from './charging-plans/charging-plans.component';
import { ChargingStationAdvancedComponent } from './charging-station-advanced/charging-station-advanced.component';
import { ChargingStationLimitationComponent } from './charging-station-limitation.component';
import { ChargingStationLimitationDialogComponent } from './charging-station-limitation.dialog.component';
import { ChargingStationStaticLimitationComponent } from './static-limitation/charging-station-static-limitation.component';
import { ChargingStationPowerSliderComponent } from './components/charging-station-power-slider.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule,
    MatProgressBarModule,
    FormattersModule,
    ComponentModule,
    ChartModule,
  ],
  entryComponents: [
    ChargingStationLimitationComponent,
    ChargingStationLimitationDialogComponent,
    ChargingPlansComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationPowerSliderCellComponent,
    ChargingStationStaticLimitationComponent,
    ChargingPlanChartComponent,
    ChargingStationAdvancedComponent,
  ],
  declarations: [
    ChargingStationLimitationComponent,
    ChargingStationLimitationDialogComponent,
    ChargingPlansComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationPowerSliderCellComponent,
    ChargingStationStaticLimitationComponent,
    ChargingPlanChartComponent,
    ChargingStationAdvancedComponent,
  ],
  exports: [
    ChargingStationLimitationComponent,
  ],
})
export class ChargingStationLimitationModule { }
