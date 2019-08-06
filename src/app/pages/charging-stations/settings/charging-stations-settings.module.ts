import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { ComponentModule } from 'app/shared/component/component.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog.component';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { TableModule } from 'app/shared/table/table.module';
import { ChargingStationParametersComponent } from './charger-parameters/charging-station-parameters.component';
import { ChargingStationSettingsComponent } from './charging-station-settings.component';
import { ChargingStationComponent } from './charging-station.component';
import { ChargingStationOCPPConfigurationComponent } from './ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationPropertiesComponent } from './properties/charging-station-properties.component';

// tslint:disable-next-line:max-line-length
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
    ChartModule
  ],
  entryComponents: [
    ChargingStationComponent,
    ChargingStationSettingsComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent,
    SessionDialogComponent
  ],
  declarations: [
    ChargingStationComponent,
    ChargingStationSettingsComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent
  ],
  exports: [
    ChargingStationSettingsComponent
  ],
  providers: [
    ChargingStationComponent
  ]
})
export class ChargingStationsSettingsModule {
}
