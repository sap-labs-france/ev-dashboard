import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MaterialModule} from 'app/app.module';
import {TableModule} from 'app/shared/table/table.module';
import {CommonDirectivesModule} from 'app/shared/directives/common-directives.module';
import {DialogsModule} from 'app/shared/dialogs/dialogs.module';
import {FormattersModule} from 'app/shared/formatters/formatters.module';
import {ChargingStationSettingsComponent} from './charging-station-settings.component';
import {ChargingStationComponent} from './charging-station.component';
import {SiteAreaDialogComponent} from './site-area/site-area.dialog.component';
import {ChargingStationPropertiesComponent} from './properties/charging-station-properties.component';
import {ChargingStationOCPPConfigurationComponent} from './ocpp-parameters/charging-station-ocpp-parameters.component';
import {ChargingStationParametersComponent} from './charger-parameters/charging-station-parameters.component';
import {ComponentModule} from 'app/shared/component/component.module';
import {SessionDialogComponent} from 'app/shared/dialogs/session/session-dialog-component';
import {ChartModule} from 'angular2-chartjs';

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
    SiteAreaDialogComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent,
    SessionDialogComponent
  ],
  declarations: [
    ChargingStationComponent,
    ChargingStationSettingsComponent,
    SiteAreaDialogComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent
  ],
  exports: [
    ChargingStationSettingsComponent,
    SiteAreaDialogComponent
  ],
  providers: [
    ChargingStationComponent
  ]
})
export class ChargingStationsSettingsModule {
}
