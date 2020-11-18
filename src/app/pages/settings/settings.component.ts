import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import TenantComponents from '../../types/TenantComponents';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isOrganizationActive = false;
  public isRefundActive = false;
  public isPricingActive = false;
  public isBillingActive = false;
  public isSacActive = false;
  public isSmartChargingActive = false;
  public isAssetActive = false;

  constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['ocpi', 'organization', 'refund', 'pricing', 'billing', 'sac', 'smartCharging', 'asset']);
    this.isOCPIActive = this.componentService.isActive(TenantComponents.OCPI);
    this.isOrganizationActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    this.isRefundActive = this.componentService.isActive(TenantComponents.REFUND);
    this.isPricingActive = this.componentService.isActive(TenantComponents.PRICING);
    this.isBillingActive = this.componentService.isActive(TenantComponents.BILLING);
    this.isSacActive = this.componentService.isActive(TenantComponents.ANALYTICS);
    this.isSmartChargingActive = this.componentService.isActive(TenantComponents.SMART_CHARGING);
    this.isAssetActive = this.componentService.isActive(TenantComponents.ASSET);
  }
}
