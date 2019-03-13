import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from '../../app.module';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { TableModule } from 'app/shared/table/table.module';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { ChargingStationsListDataSource } from './charging-stations-list/charging-stations-list-data-source-table';
import { ChargingStationsListComponent } from './charging-stations-list/charging-stations-list.component';
import { ChargingStationsFaultyDataSource } from './charging-stations-faulty/charging-stations-faulty-data-source-table';
import { ChargingStationsFaultyComponent } from './charging-stations-faulty/charging-stations-faulty.component';
import { ComponentModule } from 'app/shared/component/component.module';
import { StartTransactionDialogComponent } from './details-content-component/start-transaction-dialog-component';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';
import { ChartModule } from 'angular2-chartjs';
// tslint:disable-next-line:max-line-length
import { ChargingStationMoreActionsDialogComponent } from './more-actions/charging-station-more-actions.dialog.component';
import { ChargingStationGetDiagnosticsComponent } from './more-actions/get-diagnostics-component/get-diagnostics.component';
import { ConnectorConsumptionChartDetailComponent } from './details-content-component/consumption-chart-detail.component';
import { ConnectorsErrorDetailComponent } from './charging-stations-faulty/detail-component/connectors-error-detail-component.component';
import { ChargingStationCellComponentsModule } from './cell-content-components/charging-station-cell-content.module';
import { ChargingStationsSettingsModule } from './charging-station-settings/charging-stations-settings.module';
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
    ChargingStationCellComponentsModule,
    ChargingStationsSettingsModule,
    ChargingStationSmartChargingModule
  ],
  entryComponents: [
    ConnectorsDetailComponent,
    StartTransactionDialogComponent,
    SessionDialogComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ConnectorConsumptionChartDetailComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent,
    ConnectorsErrorDetailComponent
  ],
  declarations: [
    ChargingStationsComponent,
    ConnectorsDetailComponent,
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent,
    ChargingStationGetDiagnosticsComponent,
    ConnectorConsumptionChartDetailComponent,
    ChargingStationsListComponent,
    ChargingStationsFaultyComponent,
    ConnectorsErrorDetailComponent
  ],
  exports: [
    StartTransactionDialogComponent,
    ChargingStationMoreActionsDialogComponent
  ],
  providers: [
  ]
})
export class ChargingStationsModule { }
