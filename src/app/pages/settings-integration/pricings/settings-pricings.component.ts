import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ComponentService } from '../../../services/component.service';
import { AnalyticsSettings } from '../../../types/Setting';
import { TenantComponents } from '../../../types/Tenant';
import { SettingsPricingsTableDataSource } from './settings-pricing-table-data-source';

@Component({
  selector: 'app-settings-pricings',
  templateUrl: 'settings-pricings.component.html',
})
export class SettingsPricingsComponent {
  public isActive = false;
  public analyticsSettings!: AnalyticsSettings;
  public formGroup: FormGroup;

  public constructor(
    componentService: ComponentService,
    public settingsPricingsTableDataSource: SettingsPricingsTableDataSource,
  ) {
    this.isActive = componentService.isActive(TenantComponents.PRICING);
  }
}
