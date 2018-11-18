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
import { ConsumptionProgressBarComponent } from './cell-content-components/consumption-progress-bar.component';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { ConnectorAvailibilityComponent } from './details-content-component/connector-availibility.component';
import { SimpleTableModule } from '../../shared/table/simple-table/simple-table.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';

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
    ConsumptionProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent],
  declarations: [
    ChargingStationsComponent,
    HeartbeatCellComponent,
    ConsumptionProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent
  ]
})
export class ChargingStationsModule { }
