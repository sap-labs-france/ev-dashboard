import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentEnum, ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isRefundActive = false;
  public isPricingActive = false;
  public isSacActive = false;

  constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['ocpi', 'refund', 'pricing', 'sac']);
    this.isOCPIActive = this.componentService.isActive(ComponentEnum.OCPI);
    this.isRefundActive = this.componentService.isActive(ComponentEnum.REFUND);
    this.isPricingActive = this.componentService.isActive(ComponentEnum.PRICING);
    this.isSacActive = this.componentService.isActive(ComponentEnum.ANALYTICS);
  }
}
