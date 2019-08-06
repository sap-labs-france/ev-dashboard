import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
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
import { SmartChargingLimitPlannerChartComponent } from './limit-planner/smart-charging-limit-planner-chart.component';
import { SmartChargingLimitPlannerComponent } from './limit-planner/smart-charging-limit-planner.component';
import { SmartChargingLimitChartComponent } from './limit-planning/smart-charging-limit-chart.component';
import { SmartChargingLimitPlanningComponent } from './limit-planning/smart-charging-limit-planning.component';
import { SmartChargingMasterLimitComponent } from './master-limit/smart-charging-master-limit.component';
import { SmartChargingPowerSliderComponent } from './smart-charging-power-slider.component';
import { ChargingStationSmartChargingDialogComponent } from './smart-charging.dialog.component';
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
    SmartChargingMasterLimitComponent,
    SmartChargingPowerSliderComponent,
    SmartChargingLimitPlanningComponent,
    SmartChargingLimitPlannerComponent,
    SessionDialogComponent,
    SmartChargingLimitChartComponent,
    SmartChargingLimitPlannerChartComponent,
  ],
  declarations: [
    ChargingStationSmartChargingDialogComponent,
    SmartChargingMasterLimitComponent,
    SmartChargingPowerSliderComponent,
    SmartChargingLimitPlanningComponent,
    SmartChargingLimitPlannerComponent,
    SmartChargingLimitChartComponent,
    SmartChargingLimitPlannerChartComponent
  ],
  exports: [
    ChargingStationSmartChargingDialogComponent
  ],
})
export class ChargingStationSmartChargingModule { }
