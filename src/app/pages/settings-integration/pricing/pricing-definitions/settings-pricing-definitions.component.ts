import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ComponentService } from '../../../../services/component.service';
import { AnalyticsSettings } from '../../../../types/Setting';
import { TenantComponents } from '../../../../types/Tenant';
import { SettingsPricingDefinitionsTableDataSource } from './settings-pricing-definition-table-data-source';

@Component({
  selector: 'app-settings-pricing-definitions',
  templateUrl: 'settings-pricing-definitions.component.html',
})
export class SettingsPricingDefinitionsComponent {
  public isActive = false;
  public analyticsSettings!: AnalyticsSettings;
  public formGroup: FormGroup;

  public constructor(
    componentService: ComponentService,
    public settingsPricingsTableDataSource: SettingsPricingDefinitionsTableDataSource,
  ) {
    this.isActive = componentService.isActive(TenantComponents.PRICING);
  }
}
