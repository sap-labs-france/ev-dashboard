import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog.component';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
// tslint:disable-next-line:max-line-length
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './limit-planner/charging-station-smart-charging-limit-planner-chart.component';
import { ChargingStationSmartChargingLimitPlannerComponent } from './limit-planner/charging-station-smart-charging-limit-planner.component';
import { ChargingStationSmartChargingLimitChartComponent } from './limit-planning/charging-station-smart-charging-limit-chart.component';
import { ChargingStationSmartChargingLimitPlanningComponent } from './limit-planning/charging-station-smart-charging-limit-planning.component';
import { ChargingStationSmartChargingMasterLimitComponent } from './master-limit/charging-station-smart-charging-master-limit.component';
import { ChargingStationSmartChargingPowerSliderComponent } from './component/charging-station-smart-charging-power-slider.component';
import { ChargingStationSmartChargingDialogComponent } from './charging-station-smart-charging.dialog.component';
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
    ChartModule
  ],
  entryComponents: [
    ChargingStationSmartChargingDialogComponent,
    ChargingStationSmartChargingMasterLimitComponent,
    ChargingStationSmartChargingPowerSliderComponent,
    ChargingStationSmartChargingLimitPlanningComponent,
    ChargingStationSmartChargingLimitPlannerComponent,
    SessionDialogComponent,
    ChargingStationSmartChargingLimitChartComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
  ],
  declarations: [
    ChargingStationSmartChargingDialogComponent,
    ChargingStationSmartChargingMasterLimitComponent,
    ChargingStationSmartChargingPowerSliderComponent,
    ChargingStationSmartChargingLimitPlanningComponent,
    ChargingStationSmartChargingLimitPlannerComponent,
    ChargingStationSmartChargingLimitChartComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent
  ],
  exports: [
    ChargingStationSmartChargingDialogComponent
  ],
})
export class ChargingStationSmartChargingModule { }
