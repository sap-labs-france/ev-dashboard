import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChargingStationAdvancedComponent } from './charging-station-advanced/charging-station-advanced.component';
import { ChargingStationChargingLimitComponent } from './charging-station-charging-limit.component';
import { ChargingStationChargingLimitDialogComponent } from './charging-station-charging-limit.dialog.component';
import { ChargingStationChargingProfileLimitComponent } from './charging-profile-limit/charging-station-charging-profile-limit.component';
import { ChargingStationPowerSliderComponent } from './component/charging-station-power-slider.component';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-profile-limit/charging-station-charging-profile-limit-chart.component';
import { ChargingStationStaticLimitComponent } from './static-limit/charging-station-static-limit.component';
import { ChargingStationsChargingProfilePowerSliderCellComponent } from './cell-components/charging-stations-charging-profile-power-slider-cell';
import { ChartModule } from 'angular2-chartjs';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from 'app/app.module';
import { NgModule } from '@angular/core';
import { TableModule } from 'app/shared/table/table.module';
import { TranslateModule } from '@ngx-translate/core';

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
    ChargingStationChargingLimitComponent,
    ChargingStationChargingLimitDialogComponent,
    ChargingStationChargingProfileLimitComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationsChargingProfilePowerSliderCellComponent,
    ChargingStationStaticLimitComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
    ChargingStationAdvancedComponent,
  ],
  declarations: [
    ChargingStationChargingLimitComponent,
    ChargingStationChargingLimitDialogComponent,
    ChargingStationChargingProfileLimitComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationsChargingProfilePowerSliderCellComponent,
    ChargingStationStaticLimitComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
    ChargingStationAdvancedComponent,
  ],
  exports: [
    ChargingStationChargingLimitComponent,
  ],
})
export class ChargingStationSmartChargingModule { }
