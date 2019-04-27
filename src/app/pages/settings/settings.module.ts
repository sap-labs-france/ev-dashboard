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
import {EndpointDialogComponent} from './ocpi/endpoints/dialog/endpoint.dialog.component';
import {OcpiendpointStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-status.component';
import {OcpiendpointDetailPatchJobStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-detail-patch-job-status.component';
import {OcpiendpointPatchJobResultComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-patch-job-result.component';
import {OcpiendpointDetailTotalEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-detail-total-evses-status.component';
// tslint:disable-next-line:max-line-length
import {OcpiendpointDetailSuccessEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-detail-success-evses-status.component';
// tslint:disable-next-line:max-line-length
import {OcpiDetailFailureEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-detail-failure-evses-status.component';
import {AppFormatOcpiEvsesFailurePipe} from './ocpi/endpoints/formatters/ocpi-endpoint-detail-failure-evses-status.component';
import {OcpiendpointDetailComponent} from './ocpi/endpoints/ocpi-endpoint-details/ocpi-endpoint-detail-component.component';
import {OcpiPatchJobStatusComponent} from './ocpi/endpoints/formatters/ocpi-endpoint-patch-job-status.component';
import {AppFormatOcpiJobStatusPipe} from './ocpi/endpoints/formatters/ocpi-endpoint-patch-job-status.component';
import {SettingsRefundComponent} from './refund/settings-refund.component';
import {SettingsPricingComponent} from './pricing/settings-pricing.component';
import {SettingsSacComponent} from './sac/settings-sac.component';
import {SacLinkDialogComponent} from './sac/sac-links/sac-link.dialog.component';

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
    SettingsRefundComponent,
    SettingsPricingComponent,
    SettingsSacComponent,
    SacLinkDialogComponent,
    SettingsOcpiBusinessDetailsComponent,
    SettingsOcpiEndpointsComponent,
    EndpointDialogComponent,
    OcpiendpointStatusComponent,
    OcpiendpointDetailPatchJobStatusComponent,
    OcpiendpointPatchJobResultComponent,
    OcpiendpointDetailTotalEvsesStatusComponent,
    OcpiendpointDetailSuccessEvsesStatusComponent,
    OcpiDetailFailureEvsesStatusComponent,
    AppFormatOcpiEvsesFailurePipe,
    OcpiPatchJobStatusComponent,
    AppFormatOcpiJobStatusPipe,
    OcpiendpointDetailComponent
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsRefundComponent,
    SettingsPricingComponent,
    SettingsSacComponent,
    SacLinkDialogComponent,
    EndpointDialogComponent,
    OcpiendpointStatusComponent,
    OcpiendpointDetailPatchJobStatusComponent,
    OcpiendpointPatchJobResultComponent,
    OcpiendpointDetailTotalEvsesStatusComponent,
    OcpiendpointDetailSuccessEvsesStatusComponent,
    OcpiDetailFailureEvsesStatusComponent,
    OcpiPatchJobStatusComponent,
    OcpiendpointDetailComponent
  ],
  providers: []
})

export class SettingsModule {
}
