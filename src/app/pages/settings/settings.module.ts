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
import {SettingsOcpiEndpointsComponent} from './ocpi/endpoints/settings-ocpi.component';
import {EndpointDialogComponent} from './ocpi/endpoints/dialog/endpoint.dialog.component';
import {OcpiEndpointStatusComponent} from './ocpi/endpoints/formatters/ocpi-status.component';
import {AppFormatOcpiStatusPipe} from './ocpi/endpoints/formatters/ocpi-status.component';
import {OcpiDetailJobStatusComponent} from './ocpi/endpoints/formatters/ocpi-detail-job-status.component';
import {AppFormatOcpiDetailJobStatusPipe} from './ocpi/endpoints/formatters/ocpi-detail-job-status.component';
import {OcpiPatchJobResultComponent} from './ocpi/endpoints/formatters/ocpi-patch-job-result.component';
import {AppFormatOcpiPatchJobResultPipe} from './ocpi/endpoints/formatters/ocpi-patch-job-result.component';
import {AppFormatOcpiEvsesTotalPipe} from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status.component';
import {OcpiDetailTotalEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status.component';
import {OcpiDetailSuccessEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-detail-success-evses-status.component';
import {OcpiDetailFailureEvsesStatusComponent} from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status.component';
import {AppFormatOcpiEvsesFailurePipe} from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status.component';
import {OcpiEndpointDetailComponent} from './ocpi/endpoints/ocpi-details/ocpi-detail-component.component';
import {OcpiPatchJobStatusComponent} from './ocpi/endpoints/formatters/ocpi-patch-job-status.component';
import {AppFormatOcpiPatchJobStatusPipe} from './ocpi/endpoints/formatters/ocpi-patch-job-status.component';
import {SettingsRefundComponent} from './refund/settings-refund.component';
import {SettingsPricingComponent} from './pricing/settings-pricing.component';
import {SettingsConvergentChargingComponent} from './pricing/convergent-charging/settings-convergent-charging.component';
import {SettingsSimplePricingComponent} from './pricing/simple/settings-simple-pricing.component';
import {SettingsAnalyticsComponent} from './analytics/settings-analytics.component';
import {AnalyticsLinkDialogComponent} from './analytics/analytics-link/analytics-link.dialog.component';
import {AnalyticsLinksDataSource} from './analytics/analytics-link/analytics-links-source-table';
import {OcpiJobResultComponent} from './ocpi/endpoints/formatters/ocpi-job-result.component';
import {AppFormatOcpiJobResultPipe} from './ocpi/endpoints/formatters/ocpi-job-result.component';
import {OcpiEndpointDetailDataSource} from './ocpi/endpoints/ocpi-details/ocpi-detail-data-source-table';
import {EndpointsDataSource} from './ocpi/endpoints/settings-ocpi-source-table';
import {SettingsSacComponent} from './analytics/sac/settings-sac.component';

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
    SettingsSimplePricingComponent,
    SettingsConvergentChargingComponent,
    SettingsAnalyticsComponent,
    SettingsSacComponent,
    OcpiJobResultComponent,
    AnalyticsLinkDialogComponent,
    SettingsOcpiBusinessDetailsComponent,
    SettingsOcpiEndpointsComponent,
    EndpointDialogComponent,
    OcpiEndpointStatusComponent,
    AppFormatOcpiStatusPipe,
    OcpiDetailJobStatusComponent,
    AppFormatOcpiDetailJobStatusPipe,
    AppFormatOcpiJobResultPipe,
    OcpiPatchJobResultComponent,
    AppFormatOcpiPatchJobResultPipe,
    OcpiDetailTotalEvsesStatusComponent,
    AppFormatOcpiEvsesTotalPipe,
    OcpiDetailSuccessEvsesStatusComponent,
    OcpiDetailFailureEvsesStatusComponent,
    AppFormatOcpiEvsesFailurePipe,
    OcpiPatchJobStatusComponent,
    AppFormatOcpiPatchJobStatusPipe,
    OcpiEndpointDetailComponent
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsRefundComponent,
    SettingsPricingComponent,
    SettingsConvergentChargingComponent,
    SettingsAnalyticsComponent,
    SettingsSimplePricingComponent,
    SettingsSacComponent,
    AnalyticsLinkDialogComponent,
    EndpointDialogComponent,
    OcpiEndpointStatusComponent,
    OcpiDetailJobStatusComponent,
    OcpiPatchJobResultComponent,
    OcpiDetailTotalEvsesStatusComponent,
    OcpiDetailSuccessEvsesStatusComponent,
    OcpiDetailFailureEvsesStatusComponent,
    OcpiPatchJobStatusComponent,
    OcpiEndpointDetailComponent
  ],
  providers: [
    OcpiEndpointDetailDataSource,
    EndpointsDataSource,
    AnalyticsLinksDataSource
  ]
})

export class SettingsModule {
}
