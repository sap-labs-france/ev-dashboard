import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import { TenantComponents } from '../../types/Tenant';

declare const $: any;

@Component({
  selector: 'app-settings-integration',
  templateUrl: 'settings-integration.component.html',
})
export class SettingsIntegrationComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isOICPActive = false;
  public isOrganizationActive = false;
  public isRefundActive = false;
  public isPricingActive = false;
  public isBillingActive = false;
  public isSacActive = false;
  public isSmartChargingActive = false;
  public isAssetActive = false;
  public isCarConnectorActive = false;
  public canListOCPIEndpoints: boolean;
  public canListOICPEndpoints: boolean;

  public constructor(
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, [
      'roaming',
      'oicp',
      'refunding',
      'pricing',
      'billing',
      'analytics',
      'smartCharging',
      'asset',
      'carConnector',
    ]);
    this.isOCPIActive = this.componentService.isActive(TenantComponents.OCPI);
    this.isOICPActive = this.componentService.isActive(TenantComponents.OICP);
    this.isOrganizationActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    this.isRefundActive = this.componentService.isActive(TenantComponents.REFUND);
    this.isPricingActive = this.componentService.isActive(TenantComponents.PRICING);
    this.isBillingActive = this.componentService.isActive(TenantComponents.BILLING);
    this.isSacActive = this.componentService.isActive(TenantComponents.ANALYTICS);
    this.isSmartChargingActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
    this.isAssetActive = this.componentService.isActive(TenantComponents.ASSET);
    this.isCarConnectorActive = this.componentService.isActive(TenantComponents.CAR_CONNECTOR);
    this.canListOCPIEndpoints = this.authorizationService.canListOcpiEndpoint();
    this.canListOICPEndpoints = this.authorizationService.canListOicpEndpoint();
  }
}
