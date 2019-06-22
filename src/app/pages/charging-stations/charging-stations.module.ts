import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { MaterialModule } from '../../app.module';
import { AppFormatConnector, ConnectorCellComponent } from './cell-content-components/connector-cell.component';
import { AppFormatConnectorStatus, ConnectorStatusComponent } from './cell-content-components/connector-status.component';
import { ConnectorsCellComponent } from './cell-content-components/connectors-cell.component';
import { HeartbeatCellComponent } from './cell-content-components/heartbeat-cell.component';
import { AppFormatPowerChargerPipe, InstantPowerChargerProgressBarComponent } from './cell-content-components/instant-power-charger-progress-bar.component';
import { AppFormatPowerConnectorPipe, InstantPowerConnectorProgressBarComponent } from './cell-content-components/instant-power-connector-progress-bar.component';
import { SessionDetailComponent } from './cell-content-components/session-detail.component';
import { ChargingStationsSettingsModule } from './charging-station-settings/charging-stations-settings.module';
import { ChargingStationsFaultyDataSource } from './charging-stations-faulty/charging-stations-faulty-data-source-table';
import { ChargingStationsFaultyComponent } from './charging-stations-faulty/charging-stations-faulty.component';
import { ChargingStationsListDataSource } from './charging-stations-list/charging-stations-list-data-source-table';
import { ChargingStationsListComponent } from './charging-stations-list/charging-stations-list.component';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { ConnectorsDataSource } from './details-content-component/connectors-data-source-detail-table';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { StartTransactionDialogComponent } from './details-content-component/start-transaction-dialog-component';
import { ChargingStationMoreActionsDialogComponent } from './more-actions/charging-station-more-actions.dialog.component';
import { ChargingStationGetDiagnosticsComponent } from './more-actions/get-diagnostics-component/get-diagnostics.component';
import { ChargingStationSmartChargingModule } from './smart-charging/charging-station-smart-charging.module';

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
    ChargingStationsSettingsModule,
    ChargingStationSmartChargingModule
  ],
  entryComponents: [
    ConnectorsDetailComponent,
    StartTransactionDialogComponent,
    SessionDialogComponent,
    HeartbeatCellComponent,
    SessionDetailComponent,
    InstantPowerChargerProgressBarComponent,
    InstantPowerConnectorProgressBarComponent,
    ConnectorStatusComponent,
    ConnectorsCellComponent,
    ConnectorCellComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  declarations: [
    AppFormatPowerChargerPipe,
    AppFormatPowerConnectorPipe,
    AppFormatConnectorStatus,
    AppFormatConnector,
    HeartbeatCellComponent,
    SessionDetailComponent,
    InstantPowerChargerProgressBarComponent,
    InstantPowerConnectorProgressBarComponent,
    ConnectorStatusComponent,
    ConnectorsCellComponent,
    ConnectorCellComponent,
    ChargingStationsComponent,
    ConnectorsDetailComponent,
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  exports: [
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent
  ],
  providers: [
    ChargingStationsFaultyDataSource,
    ChargingStationsListDataSource,
    ConnectorsDataSource
  ]
})
export class ChargingStationsModule {
}
