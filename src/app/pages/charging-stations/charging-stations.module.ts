import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MomentModule } from 'ngx-moment';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction.dialog.component';

import { MaterialModule } from '../../app.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AppChargingStationsFormatConnectorPipe, ChargingStationsConnectorCellComponent } from './cell-components/charging-stations-connector-cell.component';
import { ChargingStationsConnectorInactivityCellComponent } from './cell-components/charging-stations-connector-inactivity-cell.component';
import { AppChargingStationsFormatConnectorStatusPipe, ChargingStationsConnectorStatusCellComponent } from './cell-components/charging-stations-connector-status-cell.component';
import { ChargingStationsConnectorsCellComponent } from './cell-components/charging-stations-connectors-cell.component';
import { AppChargingStationsFormatFirmwareStatusPipe, ChargingStationsFirmwareStatusCellComponent } from './cell-components/charging-stations-firmware-status-cell.component';
import { ChargingStationsHeartbeatCellComponent } from './cell-components/charging-stations-heartbeat-cell.component';
import { AppChargingStationsFormatPowerChargerPipe, ChargingStationsInstantPowerChargerProgressBarCellComponent } from './cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { AppChargingStationsFormatPowerConnectorPipe, ChargingStationsInstantPowerConnectorProgressBarCellComponent } from './cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { ChargingStationsTransactionDetailComponentCellComponent } from './cell-components/charging-stations-transaction-detail-cell.component';
import { ChargingPlansListTableDataSource } from './charging-plans/charging-plans-list-table-data-source';
import { ChargingPlansListComponent } from './charging-plans/charging-plans-list.component';
import { ChargingStationPowerSliderCellComponent } from './charging-station-limitation/cell-components/charging-station-power-slider-cell.component';
import { ChargingPlanChartComponent } from './charging-station-limitation/charging-plans/charging-plan-chart.component';
import { ChargingPlansComponent } from './charging-station-limitation/charging-plans/charging-plans.component';
import { ChargingStationAdvancedComponent } from './charging-station-limitation/charging-station-advanced/charging-station-advanced.component';
import { ChargingStationLimitationComponent } from './charging-station-limitation/charging-station-limitation.component';
import { ChargingStationLimitationDialogComponent } from './charging-station-limitation/charging-station-limitation.dialog.component';
import { ChargingStationPowerSliderComponent } from './charging-station-limitation/components/charging-station-power-slider.component';
import { ChargingStationStaticLimitationComponent } from './charging-station-limitation/static-limitation/charging-station-static-limitation.component';
import { ChargingStationsStartTransactionDialogComponent } from './charging-station-start-transaction/charging-stations-start-transaction-dialog-component';
import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationComponent } from './charging-station/charging-station.component';
import { ChargingStationFirmwareUpdateComponent } from './charging-station/firmware-update/charging-station-firmware-update.component';
import { ChargingStationOcppParametersInputFieldCellComponent } from './charging-station/ocpp-parameters/cell-components/charging-station-ocpp-parameters-input-field-cell.component';
import { ChargingStationOcppParametersEditableTableDataSource } from './charging-station/ocpp-parameters/charging-station-ocpp-parameters-editable-table-data-source.component';
import { ChargingStationOcppParametersComponent } from './charging-station/ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationChargePointComponent } from './charging-station/parameters/charge-point/charging-station-charge-point.component';
import { ChargingStationParametersComponent } from './charging-station/parameters/charging-station-parameters.component';
import { ChargingStationConnectorComponent } from './charging-station/parameters/connector/charging-station-connector.component';
import { ChargingStationPropertiesComponent } from './charging-station/properties/charging-station-properties.component';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { ChargingStationsConnectorsDetailComponent } from './details-component/charging-stations-connectors-detail-component.component';
import { ChargingStationsConnectorsDetailTableDataSource } from './details-component/charging-stations-connectors-detail-table-data-source';
import { ChargingStationsInErrorTableDataSource } from './in-error/charging-stations-in-error-table-data-source';
import { ChargingStationsInErrorComponent } from './in-error/charging-stations-in-error.component';
import { ChargingStationsListTableDataSource } from './list/charging-stations-list-table-data-source';
import { ChargingStationsListComponent } from './list/charging-stations-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ChargingStationsRoutes),
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
    MomentModule,
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
    ChargingStationDialogComponent,
    ChargingStationComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOcppParametersComponent,
    ChargingStationParametersComponent,
    ChargingStationConnectorComponent,
    ChargingStationChargePointComponent,
    ChargingStationsConnectorsDetailComponent,
    ChargingStationsStartTransactionDialogComponent,
    TransactionDialogComponent,
    ChargingStationsHeartbeatCellComponent,
    ChargingStationsTransactionDetailComponentCellComponent,
    ChargingStationsInstantPowerChargerProgressBarCellComponent,
    ChargingStationsInstantPowerConnectorProgressBarCellComponent,
    ChargingStationsConnectorStatusCellComponent,
    ChargingStationsConnectorsCellComponent,
    ChargingStationsConnectorCellComponent,
    ChargingStationOcppParametersInputFieldCellComponent,
    ChargingStationsListComponent,
    ChargingStationsInErrorComponent,
    ChargingStationsConnectorInactivityCellComponent,
    ChargingStationFirmwareUpdateComponent,
    ChargingStationsFirmwareStatusCellComponent,
    ChargingPlansListComponent,
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
    ChargingStationDialogComponent,
    ChargingStationComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOcppParametersComponent,
    ChargingStationParametersComponent,
    ChargingStationConnectorComponent,
    ChargingStationChargePointComponent,
    AppChargingStationsFormatPowerChargerPipe,
    AppChargingStationsFormatPowerConnectorPipe,
    AppChargingStationsFormatConnectorPipe,
    AppChargingStationsFormatConnectorStatusPipe,
    AppChargingStationsFormatFirmwareStatusPipe,
    ChargingStationsHeartbeatCellComponent,
    ChargingStationsTransactionDetailComponentCellComponent,
    ChargingStationsInstantPowerChargerProgressBarCellComponent,
    ChargingStationsInstantPowerConnectorProgressBarCellComponent,
    ChargingStationsConnectorStatusCellComponent,
    ChargingStationsConnectorsCellComponent,
    ChargingStationsConnectorCellComponent,
    ChargingStationOcppParametersInputFieldCellComponent,
    ChargingStationsComponent,
    ChargingStationsConnectorsDetailComponent,
    ChargingStationsStartTransactionDialogComponent,
    ChargingStationsListComponent,
    ChargingStationsInErrorComponent,
    ChargingStationsConnectorInactivityCellComponent,
    ChargingStationFirmwareUpdateComponent,
    ChargingStationsFirmwareStatusCellComponent,
    ChargingPlansListComponent,
  ],
  providers: [
    ChargingStationsInErrorTableDataSource,
    ChargingStationsListTableDataSource,
    ChargingStationsConnectorsDetailTableDataSource,
    ChargingStationOcppParametersEditableTableDataSource,
    ChargingPlansListTableDataSource,
  ],
})
export class ChargingStationsModule {
}
