import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { AnalyticsLinkDialogComponent } from './analytics/analytics-link/analytics-link-dialog.component';
import { AnalyticsLinksTableDataSource } from './analytics/analytics-link/analytics-links-table-data-source';
import { SettingsSacComponent } from './analytics/sac/settings-sac.component';
import { SettingsAnalyticsComponent } from './analytics/settings-analytics.component';
import { AssetConnectionComponent } from './asset/connection/asset-connection.component';
import { AssetConnectionDialogComponent } from './asset/connection/asset-connection.dialog.component';
import { SchneiderAssetConnectionComponent } from './asset/connection/schneider/schneider-asset-connection.component';
import { SettingsAssetConnectionEditableTableDataSource } from './asset/settings-asset-connections-list-table-data-source';
import { SettingsAssetComponent } from './asset/settings-asset.component';
import { SettingsBillingComponent } from './billing/settings-billing.component';
import { SettingsStripeComponent } from './billing/stripe/settings-stripe.component';
import { SettingsOcpiEnpointComponent } from './ocpi/endpoints/endpoint/settings-ocpi-endpoint.component';
import { SettingsOcpiEnpointDialogComponent } from './ocpi/endpoints/endpoint/settings-ocpi-endpoint.dialog.component';
import { AppFormatOcpiEvsesFailurePipe, OcpiDetailFailureEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status-formatter.component';
import { AppFormatOcpiDetailJobStatusPipe, OcpiDetailJobStatusFomatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-job-status-formatter.component';
import { OcpiDetailSuccessEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-success-evses-status-formatter.component';
import { AppFormatOcpiEvsesTotalPipe, OcpiDetailTotalEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status-formatter.component';
import { AppFormatOcpiJobResultPipe, OcpiJobResultFormatterComponent } from './ocpi/endpoints/formatters/ocpi-job-result-formatter.component';
import { AppFormatOcpiPatchJobResultPipe, OcpiPatchJobResultFormatterComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-result-formatter.component';
import { AppFormatOcpiPatchJobStatusPipe, OcpiPatchJobStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-status-formatter.component';
import { AppFormatOcpiStatusPipe, OcpiEndpointStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-status-formatter.component';
import { SettingsOcpiEndpointsDetailsTableDataSource } from './ocpi/endpoints/ocpi-details/settings-ocpi-endpoints-details-table-data-source';
import { SettingsOcpiEnpointsDetailsComponent } from './ocpi/endpoints/ocpi-details/settings-ocpi-endpoints-details.component';
import { SettingsOcpiEndpointsTableDataSource } from './ocpi/endpoints/settings-ocpi-endpoints-table-data-source';
import { SettingsOcpiEnpointsComponent } from './ocpi/endpoints/settings-ocpi-endpoints.component';
import { SettingsOcpiComponent } from './ocpi/settings-ocpi.component';
import { SettingsConvergentChargingComponent } from './pricing/convergent-charging/settings-convergent-charging.component';
import { SettingsPricingComponent } from './pricing/settings-pricing.component';
import { SettingsSimplePricingComponent } from './pricing/simple/settings-simple-pricing.component';
import { SettingsConcurComponent } from './refund/concur/settings-concur.component';
import { SettingsRefundComponent } from './refund/settings-refund.component';
import { AppRegistrationTokenStatusPipe, RegistrationTokenStatusComponent } from './registration-tokens/registration-token/registration-token-status.component';
import { RegistrationTokenComponent } from './registration-tokens/registration-token/registration-token.component';
import { RegistrationTokenDialogComponent } from './registration-tokens/registration-token/registration-token.dialog.component';
import { RegistrationTokensComponent } from './registration-tokens/registration-tokens.component';
import { SettingsComponent } from './settings.component';
import { SettingsRoutes } from './settings.routing';
import { SettingsSapSmartChargingComponent } from './smart-charging/sap-smart-charging/settings-sap-smart-charging.component';
import { SettingsSmartChargingComponent } from './smart-charging/settings-smart-charging.component';

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
    CommonDirectivesModule,
    FormattersModule,
  ],
  declarations: [
    SettingsComponent,
    SettingsOcpiComponent,
    RegistrationTokensComponent,
    SettingsRefundComponent,
    SettingsConcurComponent,
    SettingsPricingComponent,
    SettingsSimplePricingComponent,
    SettingsConvergentChargingComponent,
    SettingsBillingComponent,
    SettingsStripeComponent,
    SettingsAnalyticsComponent,
    SettingsSacComponent,
    SettingsSmartChargingComponent,
    SettingsSapSmartChargingComponent,
    OcpiJobResultFormatterComponent,
    AnalyticsLinkDialogComponent,
    SettingsOcpiComponent,
    SettingsOcpiEnpointsComponent,
    SettingsOcpiEnpointDialogComponent,
    SettingsOcpiEnpointComponent,
    SettingsAssetComponent,
    AssetConnectionComponent,
    AssetConnectionDialogComponent,
    RegistrationTokenDialogComponent,
    SchneiderAssetConnectionComponent,
    OcpiEndpointStatusFormatterComponent,
    AppFormatOcpiStatusPipe,
    OcpiDetailJobStatusFomatterComponent,
    AppFormatOcpiDetailJobStatusPipe,
    AppFormatOcpiJobResultPipe,
    OcpiPatchJobResultFormatterComponent,
    AppFormatOcpiPatchJobResultPipe,
    OcpiDetailTotalEvsesStatusFormatterComponent,
    AppFormatOcpiEvsesTotalPipe,
    OcpiDetailSuccessEvsesStatusFormatterComponent,
    OcpiDetailFailureEvsesStatusFormatterComponent,
    AppFormatOcpiEvsesFailurePipe,
    OcpiPatchJobStatusFormatterComponent,
    AppFormatOcpiPatchJobStatusPipe,
    SettingsOcpiEnpointsDetailsComponent,
    RegistrationTokenComponent,
    RegistrationTokenStatusComponent,
    AppRegistrationTokenStatusPipe,
  ],
  entryComponents: [
    SettingsComponent,
    SettingsOcpiComponent,
    RegistrationTokensComponent,
    SettingsOcpiEnpointsComponent,
    SettingsRefundComponent,
    SettingsConcurComponent,
    SettingsPricingComponent,
    SettingsConvergentChargingComponent,
    SettingsBillingComponent,
    SettingsStripeComponent,
    SettingsAnalyticsComponent,
    SettingsSimplePricingComponent,
    SettingsSacComponent,
    SettingsSmartChargingComponent,
    SettingsSapSmartChargingComponent,
    SettingsAssetComponent,
    AssetConnectionComponent,
    AssetConnectionDialogComponent,
    RegistrationTokenDialogComponent,
    SchneiderAssetConnectionComponent,
    AnalyticsLinkDialogComponent,
    SettingsOcpiEnpointDialogComponent,
    SettingsOcpiEnpointComponent,
    OcpiEndpointStatusFormatterComponent,
    OcpiDetailJobStatusFomatterComponent,
    OcpiPatchJobResultFormatterComponent,
    OcpiDetailTotalEvsesStatusFormatterComponent,
    OcpiDetailSuccessEvsesStatusFormatterComponent,
    OcpiDetailFailureEvsesStatusFormatterComponent,
    OcpiPatchJobStatusFormatterComponent,
    SettingsOcpiEnpointsDetailsComponent,
    RegistrationTokenComponent,
    RegistrationTokenStatusComponent,
  ],
  providers: [
    SettingsOcpiEndpointsDetailsTableDataSource,
    SettingsOcpiEndpointsTableDataSource,
    SettingsAssetConnectionEditableTableDataSource,
    AnalyticsLinksTableDataSource,
  ],
})

export class SettingsModule {
}
