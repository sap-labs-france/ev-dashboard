import { AppChargingStationsFormatConnectorPipe, ChargingStationsConnectorCellComponent } from './cell-components/charging-stations-connector-cell.component';
import { AppChargingStationsFormatConnectorStatusPipe, ChargingStationsConnectorStatusCellComponent } from './cell-components/charging-stations-connector-status-cell.component';
import { AppChargingStationsFormatFirmwareStatusPipe, ChargingStationsFirmwareStatusCellComponent } from './cell-components/charging-stations-firmware-status-cell.component';
import { AppChargingStationsFormatPowerChargerPipe, ChargingStationsInstantPowerChargerProgressBarCellComponent } from './cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { AppChargingStationsFormatPowerConnectorPipe, ChargingStationsInstantPowerConnectorProgressBarCellComponent } from './cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChargingStationChargePointComponent } from './charging-station/parameters/charge-point/charging-station-charge-point.component';
import { ChargingStationComponent } from './charging-station/charging-station.component';
import { ChargingStationConnectorComponent } from './charging-station/parameters/connector/charging-station-connector.component';
import { ChargingStationDialogComponent } from './charging-station/charging-station-dialog.component';
import { ChargingStationFirmwareUpdateComponent } from './charging-station/firmware-update/charging-station-firmware-update.component';
import { ChargingStationOcppParametersComponent } from './charging-station/ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationOcppParametersEditableTableDataSource } from './charging-station/ocpp-parameters/charging-station-ocpp-parameters-editable-table-data-source.component';
import { ChargingStationOcppParametersInputFieldCellComponent } from './charging-station/ocpp-parameters/cell-components/charging-station-ocpp-parameters-input-field-cell.component';
import { ChargingStationParametersComponent } from './charging-station/parameters/charging-station-parameters.component';
import { ChargingStationPropertiesComponent } from './charging-station/properties/charging-station-properties.component';
import { ChargingStationSmartChargingModule } from './charging-limit/charging-station-charging-limit.module';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsConnectorInactivityCellComponent } from './cell-components/charging-stations-connector-inactivity-cell.component';
import { ChargingStationsConnectorsCellComponent } from './cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsConnectorsDetailComponent } from './details-component/charging-stations-connectors-detail-component.component';
import { ChargingStationsConnectorsDetailTableDataSource } from './details-component/charging-stations-connectors-detail-table-data-source';
import { ChargingStationsHeartbeatCellComponent } from './cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationsInErrorComponent } from './in-error/charging-stations-in-error.component';
import { ChargingStationsInErrorTableDataSource } from './in-error/charging-stations-in-error-table-data-source';
import { ChargingStationsListComponent } from './list/charging-stations-list.component';
import { ChargingStationsListTableDataSource } from './list/charging-stations-list-table-data-source';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { ChargingStationsStartTransactionDialogComponent } from './details-component/charging-stations-start-transaction-dialog-component';
import { ChargingStationsTransactionDetailComponentCellComponent } from './cell-components/charging-stations-transaction-detail-cell.component';
import { ChartModule } from 'angular2-chartjs';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { CommonModule } from '@angular/common';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../../app.module';
import { MomentModule } from 'ngx-moment';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableModule } from 'app/shared/table/table.module';
import { TransactionDialogComponent } from '../transactions/transaction/transaction.dialog.component';
import { TranslateModule } from '@ngx-translate/core';

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
    ChargingStationSmartChargingModule,
    MomentModule,
  ],
  entryComponents: [
    ChargingStationDialogComponent,
    ChargingStationComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOcppParametersComponent,
    ChargingStationParametersComponent,
    ChargingStationConnectorComponent,
    ChargingStationChargePointComponent,
    TransactionDialogComponent,
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
  ],
  declarations: [
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
  ],
  exports: [
    ChargingStationsStartTransactionDialogComponent,
  ],
  providers: [
    ChargingStationsInErrorTableDataSource,
    ChargingStationsListTableDataSource,
    ChargingStationsConnectorsDetailTableDataSource,
    ChargingStationOcppParametersEditableTableDataSource,
  ],
})
export class ChargingStationsModule {
}
