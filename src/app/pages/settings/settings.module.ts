import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';

import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AnalyticsLinkDialogComponent } from './analytics/analytics-link/analytics-link-dialog.component';
import { AnalyticsLinksTableDataSource } from './analytics/analytics-link/analytics-links-table-data-source';
import { SettingsSacComponent } from './analytics/sac/settings-sac.component';
import { SettingsAnalyticsComponent } from './analytics/settings-analytics.component';
import { EndpointDialogComponent } from './ocpi/endpoints/dialog/endpoint-dialog.component';
import { AppFormatOcpiEvsesFailurePipe, OcpiDetailFailureEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status.component';
import { AppFormatOcpiDetailJobStatusPipe, OcpiDetailJobStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-job-status.component';
import { OcpiDetailSuccessEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-success-evses-status.component';
import { AppFormatOcpiEvsesTotalPipe, OcpiDetailTotalEvsesStatusComponent } from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status.component';
import { AppFormatOcpiJobResultPipe, OcpiJobResultComponent } from './ocpi/endpoints/formatters/ocpi-job-result.component';
import { AppFormatOcpiPatchJobResultPipe, OcpiPatchJobResultComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-result.component';
import { AppFormatOcpiPatchJobStatusPipe, OcpiPatchJobStatusComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-status.component';
import { AppFormatOcpiStatusPipe, OcpiEndpointStatusComponent } from './ocpi/endpoints/formatters/ocpi-status.component';
import { OcpiDetailComponent } from './ocpi/endpoints/ocpi-details/ocpi-detail.component';
import { OcpiDetailTableDataSource } from './ocpi/endpoints/ocpi-details/ocpi-detail-table-data-source';
import { SettingsOcpiTableDataSource } from './ocpi/endpoints/settings-ocpi-table-data-source';
import { SettingsOcpiEndpointsComponent } from './ocpi/endpoints/settings-ocpi.component';
import { SettingsOcpiComponent } from './ocpi/settings-ocpi.component';
import { RegistrationTokensDataSourceTable } from './ocpp/registration-tokens/registration-tokens-data-source-table';
import { SettingsOcppComponent } from './ocpp/settings-ocpp.component';
import { SettingsConvergentChargingComponent } from './pricing/convergent-charging/settings-convergent-charging.component';
import { SettingsPricingComponent } from './pricing/settings-pricing.component';
import { SettingsSimplePricingComponent } from './pricing/simple/settings-simple-pricing.component';
import { SettingsConcurComponent } from './refund/concur/settings-concur.component';
import { SettingsRefundComponent } from './refund/settings-refund.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutes } from './settings.routing';

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
    SettingsOcppComponent,
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
    OcpiDetailComponent
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent,
    SettingsOcppComponent,
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
    OcpiDetailComponent
  ],
  providers: [
    OcpiDetailTableDataSource,
    SettingsOcpiTableDataSource,
    AnalyticsLinksTableDataSource
  ]
})

export class SettingsModule {
}
