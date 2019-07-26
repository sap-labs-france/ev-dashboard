import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';

import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { AnalyticsLinkDialogComponent } from './analytics/analytics-link/analytics-link.dialog.component';
import { AnalyticsLinksDataSource } from './analytics/analytics-link/analytics-links-source-table';
import { SettingsSacComponent } from './analytics/sac/settings-sac.component';
import { SettingsAnalyticsComponent } from './analytics/settings-analytics.component';
import { EndpointDialogComponent } from './ocpi/endpoints/dialog/endpoint.dialog.component';
import { AppFormatOcpiEvsesFailurePipe, OcpiDetailFailureEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status.component';
import { AppFormatOcpiDetailJobStatusPipe, OcpiDetailJobStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-job-status.component';
import { OcpiDetailSuccessEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-success-evses-status.component';
import { AppFormatOcpiEvsesTotalPipe, OcpiDetailTotalEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status.component';
import { AppFormatOcpiJobResultPipe, OcpiJobResultComponent } from './ocpi/endpoints/formatters/ocpi-job-result.component';
import { AppFormatOcpiPatchJobResultPipe, OcpiPatchJobResultComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-result.component';
import { AppFormatOcpiPatchJobStatusPipe, OcpiPatchJobStatusComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-status.component';
import { AppFormatOcpiStatusPipe, OcpiEndpointStatusComponent } from './ocpi/endpoints/formatters/ocpi-status.component';
import { OcpiEndpointDetailComponent } from './ocpi/endpoints/ocpi-details/ocpi-detail-component.component';
import { OcpiEndpointDetailDataSource } from './ocpi/endpoints/ocpi-details/ocpi-detail-data-source-table';
import { EndpointsDataSource } from './ocpi/endpoints/settings-ocpi-source-table';
import { SettingsOcpiEndpointsComponent } from './ocpi/endpoints/settings-ocpi.component';
import { SettingsOcpiComponent } from './ocpi/settings-ocpi.component';
import { SettingsConvergentChargingComponent } from './pricing/convergent-charging/settings-convergent-charging.component';
import { SettingsPricingComponent } from './pricing/settings-pricing.component';
import { SettingsSimplePricingComponent } from './pricing/simple/settings-simple-pricing.component';
import { SettingsConcurComponent } from './refund/concur/settings-concur.component';
import { SettingsRefundComponent } from './refund/settings-refund.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutes } from './settings.routing';
import { FormattersModule } from '../../shared/formatters/formatters.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    FormattersModule
  ],
  declarations: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsRefundComponent,
    SettingsConcurComponent,
    SettingsPricingComponent,
    SettingsSimplePricingComponent,
    SettingsConvergentChargingComponent,
    SettingsAnalyticsComponent,
    SettingsSacComponent,
    OcpiJobResultComponent,
    AnalyticsLinkDialogComponent,
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
    SettingsConcurComponent,
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
