import {NgModule} from '@angular/core';
import {MomentModule} from 'ngx-moment';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ChartModule} from 'angular2-chartjs';
import {MaterialModule} from '../../app.module';
import {ChargingStationsComponent} from './charging-stations.component';
import {ChargingStationsRoutes} from './charging-stations.routing';
import {TableModule} from 'app/shared/table/table.module';
import {CommonDirectivesModule} from 'app/shared/directives/common-directives.module';
import {DialogsModule} from 'app/shared/dialogs/dialogs.module';
import {ConnectorsDetailComponent} from './details-content-component/connectors-detail-component.component';
import {FormattersModule} from 'app/shared/formatters/formatters.module';
import {ChargingStationsListComponent} from './charging-stations-list/charging-stations-list.component';
import {ChargingStationsFaultyComponent} from './charging-stations-faulty/charging-stations-faulty.component';
import {ComponentModule} from 'app/shared/component/component.module';
import {StartTransactionDialogComponent} from './details-content-component/start-transaction-dialog-component';
import {SessionDialogComponent} from 'app/shared/dialogs/session/session-dialog-component';
import {ChargingStationMoreActionsDialogComponent} from './more-actions/charging-station-more-actions.dialog.component';
import {ChargingStationGetDiagnosticsComponent} from './more-actions/get-diagnostics-component/get-diagnostics.component';
import {ConnectorConsumptionChartDetailComponent} from './details-content-component/consumption-chart-detail.component';
import {ChargingStationsSettingsModule} from './charging-station-settings/charging-stations-settings.module';
import {ChargingStationSmartChargingModule} from './smart-charging/charging-station-smart-charging.module';
import {ConnectorStatusComponent} from './cell-content-components/connector-status.component';
import {AppFormatConnectorStatus} from './cell-content-components/connector-status.component';
import {ConnectorsCellComponent} from './cell-content-components/connectors-cell.component';
import {HeartbeatCellComponent} from './cell-content-components/heartbeat-cell.component';
import {InstantPowerProgressBarComponent} from './cell-content-components/instant-power-progress-bar.component';
import {AppFormatChargerPower} from './cell-content-components/instant-power-progress-bar.component';
import {SessionDetailComponent} from './cell-content-components/session-detail.component';

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
    MomentModule,
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
    InstantPowerProgressBarComponent,
    ConnectorStatusComponent,
    ConnectorsCellComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ConnectorConsumptionChartDetailComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  declarations: [
    AppFormatChargerPower,
    AppFormatConnectorStatus,
    HeartbeatCellComponent,
    SessionDetailComponent,
    InstantPowerProgressBarComponent,
    ConnectorStatusComponent,
    ConnectorsCellComponent,
    ChargingStationsComponent,
    ConnectorsDetailComponent,
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ConnectorConsumptionChartDetailComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent
  ],
  exports: [
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent
  ],
  providers: []
})
export class ChargingStationsModule {
}
