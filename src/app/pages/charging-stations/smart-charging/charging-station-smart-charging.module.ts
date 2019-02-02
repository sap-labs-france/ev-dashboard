import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from 'app/app.module';
import { TableModule } from 'app/shared/table/table.module';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { ChargingStationSmartChargingDialogComponent } from './smart-charging.dialog.component';
import { SmartChargingMasterLimitComponent } from './master-limit/smart-charging-master-limit.component';
import { ComponentModule } from 'app/shared/component/component.module';
import { SmartChargingPowerSliderComponent } from './smart-charging-power-slider.component';
import { SmartChargingLimitPlanningComponent } from './limit-planning/smart-charging-limit-planning.component'
import { SmartChargingLimitPlannerComponent } from './limit-planner/smart-charging-limit-planner.component';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';
import { SmartChargingLimitChartComponent } from './limit-planning/smart-charging-limit-chart.component';
import { ChartModule } from 'angular2-chartjs';
// tslint:disable-next-line:max-line-length
import { SmartChargingLimitPlannerChartComponent } from './limit-planner/smart-charging-limit-planner-chart.component';
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
