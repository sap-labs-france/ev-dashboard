import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { TransactionDialogComponent } from 'app/shared/dialogs/transactions/transaction-dialog.component';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';

import { ChargingStationsChargingProfilePowerSliderCellComponent } from './cell-components/charging-stations-charging-profile-power-slider-cell';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-profile-limit/charging-station-charging-profile-limit-chart.component';
import { ChargingStationChargingProfileLimitComponent } from './charging-profile-limit/charging-station-charging-profile-limit.component';
import { ChargingStationAdvancedComponent } from './charging-station-advanced/charging-station-advanced.component';
import { ChargingStationSmartChargingDialogComponent } from './charging-station-charging-limit-dialog.component';
import { ChargingStationPowerSliderComponent } from './component/charging-station-power-slider.component';
import { ChargingStationStaticLimitComponent } from './static-limit/charging-station-static-limit.component';

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
    ChargingStationSmartChargingDialogComponent,
    ChargingStationChargingProfileLimitComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationsChargingProfilePowerSliderCellComponent,
    ChargingStationStaticLimitComponent,
    TransactionDialogComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
    ChargingStationAdvancedComponent,
  ],
  declarations: [
    ChargingStationSmartChargingDialogComponent,
    ChargingStationChargingProfileLimitComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationsChargingProfilePowerSliderCellComponent,
    ChargingStationStaticLimitComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
    ChargingStationAdvancedComponent,
  ],
  exports: [
    ChargingStationSmartChargingDialogComponent,
  ],
})
export class ChargingStationSmartChargingModule { }
