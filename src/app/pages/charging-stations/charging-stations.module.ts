import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MaterialModule } from '../../app.module';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { TableModule } from '../../shared/table/table.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { HeartbeatCellComponent } from './cell-content-components/heartbeat-cell.component';
import { InstantPowerProgressBarComponent } from './cell-content-components/instant-power-progress-bar.component';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { ConnectorAvailibilityComponent } from './details-content-component/connector-availibility.component';
import { SimpleTableModule } from '../../shared/table/simple-table/simple-table.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { ConnectorsCellComponent } from "./cell-content-components/connectors-cell.component";
import { ConnectorCellComponent } from "./cell-content-components/connector-cell.component";
import { ChargingStationDialogComponent } from "./charging-station/charging-station.dialog.component";
import { ChargingStationComponent} from "./charging-station/charging-station.component";
import { ChargingStationsDataSource } from "./charging-stations-data-source-table";
import { SiteAreaDialogComponent } from './charging-station/site-area.dialog.component';
import { SiteAreaDataSource } from './charging-station/site-area-dialog-data-source-table';
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
    SimpleTableModule
  ],
  entryComponents: [
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent,
    ConnectorsCellComponent,
    ConnectorCellComponent,
    ChargingStationComponent,
    ChargingStationDialogComponent,
    SiteAreaDialogComponent
  ],
  declarations: [
    ChargingStationsComponent,
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent,
    ConnectorsCellComponent,
    ConnectorCellComponent,
    ChargingStationComponent,
    ChargingStationDialogComponent,
    SiteAreaDialogComponent
  ],
  exports: [
    ChargingStationDialogComponent,
    SiteAreaDialogComponent
  ],
  providers:[
    ChargingStationComponent,
    ChargingStationsDataSource,
    SiteAreaDataSource
  ]
})
export class ChargingStationsModule { }
