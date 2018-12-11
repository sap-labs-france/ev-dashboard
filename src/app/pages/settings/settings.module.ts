import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {SettingsComponent} from './settings.component';
import {SettingsRoutes} from './settings.routing';
import {SettingsOcpiComponent} from './ocpi/settings-ocpi.component';
import {SettingsOcpiBusinessDetailsComponent} from './ocpi/business-details/settings-ocpi-business-details.component';
import {SettingsOcpiEndpointsComponent} from './ocpi/endpoints/settings-ocpi-endpoints.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule
  ],
  declarations: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsOcpiBusinessDetailsComponent,
    SettingsOcpiEndpointsComponent
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent
  ]
})

export class SettingsModule {
}
