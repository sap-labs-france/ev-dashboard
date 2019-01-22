import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from '../../../services/authorization-service';
import { AbstractControl } from '@angular/forms';
import { CentralServerService } from '../../../services/central-server.service';
import { Constants } from '../../../utils/Constants';

@Component({
  selector: 'app-settings-pricing',
  templateUrl: 'settings-pricing.component.html'
})
export class SettingsPricingComponent implements OnInit {
  public isAdmin;
  // public formGroup: FormGroup;
  public isActive = false;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService
  ) {
    this.isActive = centralServerService.isComponentActive(Constants.SETTINGS_PRICING);
  }

  ngOnInit(): void {
  }
}
