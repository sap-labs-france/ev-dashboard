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
import { GreencomAssetConnectionComponent } from './asset/connection/greencom/greencom-asset-connection.component';
import { IothinkAssetConnectionComponent } from './asset/connection/iothink/iothink-asset-connection.component';
import { SchneiderAssetConnectionComponent } from './asset/connection/schneider/schneider-asset-connection.component';
import { WitAssetConnectionComponent } from './asset/connection/wit/wit-asset-connection.component';
import { SettingsAssetConnectionEditableTableDataSource } from './asset/settings-asset-connections-list-table-data-source';
import { SettingsAssetComponent } from './asset/settings-asset.component';
import { SettingsBillingComponent } from './billing/settings-billing.component';
import { SettingsStripeComponent } from './billing/stripe/settings-stripe.component';
import { CarConnectorConnectionComponent } from './car-connector/connection/car-connector-connection.component';
import { CarConnectorConnectionDialogComponent } from './car-connector/connection/car-connector-connection.dialog.component';
import { MercedesCarConnectorConnectionComponent } from './car-connector/connection/mercedes/mercedes-car-connector-connection.component';
import { SettingsCarConnectorConnectionEditableTableDataSource } from './car-connector/settings-car-connector-connections-list-table-data-source';
import { SettingsCarConnectorComponent } from './car-connector/settings-car-connector.component';
import { SettingsOcpiEndpointComponent } from './ocpi/endpoints/endpoint/settings-ocpi-endpoint.component';
import { SettingsOcpiEndpointDialogComponent } from './ocpi/endpoints/endpoint/settings-ocpi-endpoint.dialog.component';
import { AppFormatOcpiEvsesFailurePipe, OcpiDetailFailureEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-failure-evses-status-formatter.component';
import { AppFormatOcpiDetailJobStatusPipe, OcpiDetailJobStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-job-status-formatter.component';
import { OcpiDetailSuccessEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-success-evses-status-formatter.component';
import { AppFormatOcpiEvsesTotalPipe, OcpiDetailTotalEvsesStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-detail-total-evses-status-formatter.component';
import { AppFormatOcpiJobResultPipe, OcpiJobResultFormatterComponent } from './ocpi/endpoints/formatters/ocpi-job-result-formatter.component';
import { AppFormatOcpiPatchJobResultPipe, OcpiPatchJobResultFormatterComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-result-formatter.component';
import { AppFormatOcpiPatchJobStatusPipe, OcpiPatchJobStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-patch-job-status-formatter.component';
import { AppFormatOcpiStatusPipe, OcpiEndpointStatusFormatterComponent } from './ocpi/endpoints/formatters/ocpi-status-formatter.component';
import { SettingsOcpiEndpointsDetailsTableDataSource } from './ocpi/endpoints/ocpi-details/settings-ocpi-endpoints-details-table-data-source';
import { SettingsOcpiEndpointsDetailsComponent } from './ocpi/endpoints/ocpi-details/settings-ocpi-endpoints-details.component';
import { SettingsOcpiEndpointsTableDataSource } from './ocpi/endpoints/settings-ocpi-endpoints-table-data-source';
import { SettingsOcpiEndpointsComponent } from './ocpi/endpoints/settings-ocpi-endpoints.component';
import { SettingsOcpiComponent } from './ocpi/settings-ocpi.component';
import { SettingsOicpEndpointComponent } from './oicp/endpoints/endpoint/settings-oicp-endpoint.component';
import { SettingsOicpEndpointDialogComponent } from './oicp/endpoints/endpoint/settings-oicp-endpoint.dialog.component';
import { AppFormatOicpEvsesFailurePipe, OicpDetailFailureEvsesStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-detail-failure-evses-status-formatter.component';
import { AppFormatOicpDetailJobStatusPipe, OicpDetailJobStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-detail-job-status-formatter.component';
import { OicpDetailSuccessEvsesStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-detail-success-evses-status-formatter.component';
import { AppFormatOicpEvsesTotalPipe, OicpDetailTotalEvsesStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-detail-total-evses-status-formatter.component';
import { AppFormatOicpJobResultPipe, OicpJobResultFormatterComponent } from './oicp/endpoints/formatters/oicp-job-result-formatter.component';
import { AppFormatOicpPatchJobResultPipe, OicpPatchJobResultFormatterComponent } from './oicp/endpoints/formatters/oicp-patch-job-result-formatter.component';
import { AppFormatOicpPatchJobStatusPipe, OicpPatchJobStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-patch-job-status-formatter.component';
import { AppFormatOicpStatusPipe, OicpEndpointStatusFormatterComponent } from './oicp/endpoints/formatters/oicp-status-formatter.component';
import { SettingsOicpEndpointsDetailsTableDataSource } from './oicp/endpoints/oicp-details/settings-oicp-endpoints-details-table-data-source';
import { SettingsOicpEndpointsDetailsComponent } from './oicp/endpoints/oicp-details/settings-oicp-endpoints-details.component';
import { SettingsOicpEndpointsTableDataSource } from './oicp/endpoints/settings-oicp-endpoints-table-data-source';
import { SettingsOicpEndpointsComponent } from './oicp/endpoints/settings-oicp-endpoints.component';
import { SettingsOicpComponent } from './oicp/settings-oicp.component';
import { SettingsConvergentChargingComponent } from './pricing/convergent-charging/settings-convergent-charging.component';
import { SettingsPricingComponent } from './pricing/settings-pricing.component';
import { SettingsSimplePricingComponent } from './pricing/simple/settings-simple-pricing.component';
import { SettingsConcurComponent } from './refund/concur/settings-concur.component';
import { SettingsRefundComponent } from './refund/settings-refund.component';
import { SettingsIntegrationComponent } from './settings-integration.component';
import { SettingsRoutes } from './settings-integration.routing';
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
    SettingsIntegrationComponent,
    SettingsOcpiComponent,
    SettingsOicpComponent,
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
    OicpJobResultFormatterComponent,
    AnalyticsLinkDialogComponent,
    SettingsOcpiComponent,
    SettingsOicpComponent,
    SettingsOcpiEndpointsComponent,
    SettingsOcpiEndpointDialogComponent,
    SettingsOcpiEndpointComponent,
    SettingsOicpEndpointsComponent,
    SettingsOicpEndpointDialogComponent,
    SettingsOicpEndpointComponent,
    SettingsAssetComponent,
    AssetConnectionComponent,
    AssetConnectionDialogComponent,
    SchneiderAssetConnectionComponent,
    GreencomAssetConnectionComponent,
    IothinkAssetConnectionComponent,
    WitAssetConnectionComponent,
    SettingsCarConnectorComponent,
    CarConnectorConnectionComponent,
    CarConnectorConnectionDialogComponent,
    MercedesCarConnectorConnectionComponent,
    OcpiEndpointStatusFormatterComponent,
    OicpEndpointStatusFormatterComponent,
    AppFormatOcpiStatusPipe,
    OcpiDetailJobStatusFormatterComponent,
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
    SettingsOcpiEndpointsDetailsComponent,
    OicpEndpointStatusFormatterComponent,
    AppFormatOicpStatusPipe,
    OicpDetailJobStatusFormatterComponent,
    AppFormatOicpDetailJobStatusPipe,
    AppFormatOicpJobResultPipe,
    OicpPatchJobResultFormatterComponent,
    AppFormatOicpPatchJobResultPipe,
    OicpDetailTotalEvsesStatusFormatterComponent,
    AppFormatOicpEvsesTotalPipe,
    OicpDetailSuccessEvsesStatusFormatterComponent,
    OicpDetailFailureEvsesStatusFormatterComponent,
    AppFormatOicpEvsesFailurePipe,
    OicpPatchJobStatusFormatterComponent,
    AppFormatOicpPatchJobStatusPipe,
    SettingsOicpEndpointsDetailsComponent,
  ],
  entryComponents: [
    SettingsIntegrationComponent,
    SettingsOcpiComponent,
    SettingsOcpiEndpointsComponent,
    SettingsOicpComponent,
    SettingsOicpEndpointsComponent,
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
    SchneiderAssetConnectionComponent,
    GreencomAssetConnectionComponent,
    IothinkAssetConnectionComponent,
    WitAssetConnectionComponent,
    SettingsCarConnectorComponent,
    CarConnectorConnectionComponent,
    CarConnectorConnectionDialogComponent,
    MercedesCarConnectorConnectionComponent,
    AnalyticsLinkDialogComponent,
    SettingsOcpiEndpointDialogComponent,
    SettingsOcpiEndpointComponent,
    OcpiEndpointStatusFormatterComponent,
    OcpiDetailJobStatusFormatterComponent,
    OcpiPatchJobResultFormatterComponent,
    OcpiDetailTotalEvsesStatusFormatterComponent,
    OcpiDetailSuccessEvsesStatusFormatterComponent,
    OcpiDetailFailureEvsesStatusFormatterComponent,
    OcpiPatchJobStatusFormatterComponent,
    SettingsOcpiEndpointsDetailsComponent,
    SettingsOicpEndpointDialogComponent,
    SettingsOicpEndpointComponent,
    OicpEndpointStatusFormatterComponent,
    OicpDetailJobStatusFormatterComponent,
    OicpPatchJobResultFormatterComponent,
    OicpDetailTotalEvsesStatusFormatterComponent,
    OicpDetailSuccessEvsesStatusFormatterComponent,
    OicpDetailFailureEvsesStatusFormatterComponent,
    OicpPatchJobStatusFormatterComponent,
    SettingsOicpEndpointsDetailsComponent
  ],
  providers: [
    SettingsOcpiEndpointsDetailsTableDataSource,
    SettingsOcpiEndpointsTableDataSource,
    SettingsOicpEndpointsDetailsTableDataSource,
    SettingsOicpEndpointsTableDataSource,
    SettingsAssetConnectionEditableTableDataSource,
    SettingsCarConnectorConnectionEditableTableDataSource,
    AnalyticsLinksTableDataSource,
  ],
})

export class SettingsIntegrationModule {
}
