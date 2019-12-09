import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentService, ComponentType } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isRefundActive = false;
  public isPricingActive = false;
  public isBillingActive = false;
  public isSacActive = false;
  public isSmartChargingActive = false;

  constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['ocpi', 'refund', 'pricing', 'billing', 'sac', 'smartCharging']);
    this.isOCPIActive = this.componentService.isActive(ComponentType.OCPI);
    this.isRefundActive = this.componentService.isActive(ComponentType.REFUND);
    this.isPricingActive = this.componentService.isActive(ComponentType.PRICING);
    this.isBillingActive = this.componentService.isActive(ComponentType.BILLING);
    this.isSacActive = this.componentService.isActive(ComponentType.ANALYTICS);
    this.isSmartChargingActive = this.componentService.isActive(ComponentType.SMART_CHARGING);
  }
}
