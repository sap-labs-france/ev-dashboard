import {Component, ViewEncapsulation} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerService} from '../../services/central-server.service';
import {Constants} from '../../utils/Constants';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent extends AbstractTabComponent {
  public isOCPIActive = false;
  public isChargeAtHomeActive = false;
  public isPricingActive = false;
  public isSacActive = false;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['ocpi', 'chargeathome', 'pricing', 'sac']);
    this.isOCPIActive = centralServerService.isComponentActive(Constants.SETTINGS_OCPI);
    this.isChargeAtHomeActive = centralServerService.isComponentActive(Constants.SETTINGS_CHARGE_AT_HOME);
    this.isPricingActive = centralServerService.isComponentActive(Constants.SETTINGS_PRICING);
    this.isSacActive = centralServerService.isComponentActive(Constants.SETTINGS_SAC);
  }
}
