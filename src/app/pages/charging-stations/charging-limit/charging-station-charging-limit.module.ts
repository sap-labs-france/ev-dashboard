import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { TransactionDialogComponent } from 'app/shared/dialogs/transactions/transactions-dialog.component';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-profile-limit/charging-station-charging-profile-limit-chart.component';
import { ChargingStationChargingProfileLimitComponent } from './charging-profile-limit/charging-station-charging-profile-limit.component';
import { ChargingStationSmartChargingDialogComponent } from './charging-station-charging-limit-dialog.component';
import { ChargingStationPowerSliderComponent } from './component/charging-station-power-slider.component';
import { ChargingStationStaticLimitComponent } from './static-limit/charging-station-static-limit.component';
import { ChargingPeriodListTableDataSource } from './charging-profile-limit/list/charging-period-list-table-data-source'
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
    ChargingStationStaticLimitComponent,
    TransactionDialogComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
  ],
  declarations: [
    ChargingStationSmartChargingDialogComponent,
    ChargingStationChargingProfileLimitComponent,
    ChargingStationPowerSliderComponent,
    ChargingStationStaticLimitComponent,
    ChargingStationSmartChargingLimitPlannerChartComponent,
  ],
  exports: [
    ChargingStationSmartChargingDialogComponent,
  ],
  // providers: [
  //   ChargingPeriodListTableDataSource,
  // ],
})
export class ChargingStationSmartChargingModule { }
