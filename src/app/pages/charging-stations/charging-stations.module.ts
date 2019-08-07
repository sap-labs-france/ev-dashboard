import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog.component';
import { CommonDirectivesModule } from 'app/shared/directives/directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { MaterialModule } from '../../app.module';
import { AppFormatConnector, ChargingStationsConnectorCellComponent } from './cell-components/charging-stations-connector-cell.component';
import { ChargingStationsConnectorsCellComponent } from './cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from './cell-components/charging-stations-heartbeat-cell.component';
import { AppFormatPowerChargerPipe, ChargingStationsInstantPowerChargerProgressBarCellComponent } from './cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { AppFormatPowerConnectorPipe, ChargingStationsInstantPowerConnectorProgressBarCellComponent } from './cell-components/charging-stations-instant-power-connector-progress-bar-cell.component';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { ChargingStationsStartTransactionDialogComponent } from './details-component/charging-stations-start-transaction-dialog-component';
import { ChargingStationsFaultyTableDataSource } from './faulty/charging-stations-faulty-table-data-source';
import { ChargingStationsFaultyComponent } from './faulty/charging-stations-faulty.component';
import { ChargingStationsListTableDataSource } from './list/charging-stations-list-table-data-source';
import { ChargingStationsListComponent } from './list/charging-stations-list.component';
import { ChargingStationsMoreActionsDialogComponent } from './more-actions/charging-stations-more-actions-dialog.component';
import { ChargingStationsGetDiagnosticsComponent } from './more-actions/get-diagnostics-component/charging-stations-get-diagnostics.component';
import { ChargingStationSmartChargingModule } from './smart-charging/charging-station-smart-charging.module';
import { ChargingStationsSessionDetailComponentCellComponent } from './cell-components/charging-stations-session-detail-cell.component';
import { AppFormatConnectorStatus, ChargingStationsConnectorStatusCellComponent } from './cell-components/charging-stations-connector-status-cell.component';
import { ChargingStationsConnectorsDetailTableDataSource } from './details-component/charging-stations-connectors-detail-table-data-source';
import { ChargingStationComponent } from './charging-station/charging-station.component';
import { ChargingStationSettingsComponent } from './charging-station/settings/charging-station-settings.component';
import { ChargingStationPropertiesComponent } from './charging-station/properties/charging-station-properties.component';
import { ChargingStationOcppParametersComponent } from './charging-station/ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './charging-station/parameters/charging-station-parameters.component';
import { ChargingStationsConnectorsDetailComponent } from './details-component/charging-stations-connectors-detail-component.component';

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
    ChargingStationSmartChargingModule
  ],
  entryComponents: [
    ChargingStationComponent,
    ChargingStationSettingsComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOcppParametersComponent,
    ChargingStationParametersComponent,
    SessionDialogComponent,
    ChargingStationsConnectorsDetailComponent,
    ChargingStationsStartTransactionDialogComponent,
    SessionDialogComponent,
    ChargingStationsHeartbeatCellComponent,
    ChargingStationsSessionDetailComponentCellComponent,
    ChargingStationsInstantPowerChargerProgressBarCellComponent,
    ChargingStationsInstantPowerConnectorProgressBarCellComponent,
    ChargingStationsConnectorStatusCellComponent,
    ChargingStationsConnectorsCellComponent,
    ChargingStationsConnectorCellComponent,
    ChargingStationsMoreActionsDialogComponent,
    ChargingStationsGetDiagnosticsComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  declarations: [
    ChargingStationComponent,
    ChargingStationSettingsComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOcppParametersComponent,
    ChargingStationParametersComponent,
    AppFormatPowerChargerPipe,
    AppFormatPowerConnectorPipe,
    AppFormatConnector,
    AppFormatConnectorStatus,
    ChargingStationsHeartbeatCellComponent,
    ChargingStationsSessionDetailComponentCellComponent,
    ChargingStationsInstantPowerChargerProgressBarCellComponent,
    ChargingStationsInstantPowerConnectorProgressBarCellComponent,
    ChargingStationsConnectorStatusCellComponent,
    ChargingStationsConnectorsCellComponent,
    ChargingStationsConnectorCellComponent,
    ChargingStationsComponent,
    ChargingStationsConnectorsDetailComponent,
    ChargingStationsStartTransactionDialogComponent,
    ChargingStationsMoreActionsDialogComponent,
    ChargingStationsGetDiagnosticsComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  exports: [
    ChargingStationsStartTransactionDialogComponent,
    ChargingStationsMoreActionsDialogComponent
  ],
  providers: [
    ChargingStationsFaultyTableDataSource,
    ChargingStationsListTableDataSource,
    ChargingStationsConnectorsDetailTableDataSource
  ]
})
export class ChargingStationsModule {
}
