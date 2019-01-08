import {Component, ViewEncapsulation} from '@angular/core';
import {AuthorizationService} from '../../services/authorization-service';
import {CentralServerService} from '../../services/central-server.service';
import {Constants} from '../../utils/Constants';

declare const $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  encapsulation: ViewEncapsulation.None
})
export class SettingsComponent {
  public isOCPIActive = false;
  public isChargeAtHomeActive = false;
  public isPricingActive = false;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService
  ) {
    this.isOCPIActive = centralServerService.isComponentActive(Constants.SETTINGS_OCPI);
    this.isChargeAtHomeActive = centralServerService.isComponentActive(Constants.SETTINGS_CHARGE_AT_HOME);
    this.isPricingActive = centralServerService.isComponentActive(Constants.SETTINGS_PRICING);
  }
}
