import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';

import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TableModule} from '../../shared/table/table.module';
import {SettingsComponent} from './settings.component';
import {SettingsRoutes} from './settings.routing';
import {SettingsOcpiComponent} from './ocpi/settings-ocpi.component';
import {SettingsOcpiBusinessDetailsComponent} from './ocpi/business-details/settings-ocpi-business-details.component';
import {SettingsOcpiEndpointsComponent} from './ocpi/endpoints/settings-ocpi-endpoints.component';
import {EndpointsDataSource} from './ocpi/endpoints/settings-ocpi-endpoints-source-table';
import {EndpointDialogComponent} from './ocpi/endpoints/dialog/endpoint.dialog.component';
import {OcpiendpointStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-status.component';
import {OcpiendpointPatchJobStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-patch-job-status.component';
import {OcpiendpointPatchJobResultComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-patch-job-result.component';
import {SettingsChargeAtHomeComponent} from './charge-at-home/settings-charge-at-home.component';
import {SettingsPricingComponent} from './pricing/settings-pricing.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule
  ],
  declarations: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsChargeAtHomeComponent,
    SettingsPricingComponent,
    SettingsOcpiBusinessDetailsComponent,
    SettingsOcpiEndpointsComponent,
    EndpointDialogComponent,
    OcpiendpointStatusComponent,
    OcpiendpointPatchJobStatusComponent,
    OcpiendpointPatchJobResultComponent
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsChargeAtHomeComponent,
    SettingsPricingComponent,
    EndpointDialogComponent,
    OcpiendpointStatusComponent,
    OcpiendpointPatchJobStatusComponent,
    OcpiendpointPatchJobResultComponent
  ],
  providers: [
    EndpointsDataSource
  ]
})

export class SettingsModule {
}
