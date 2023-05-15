import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import { TenantComponents } from '../../types/Tenant';

@Component({
  selector: 'app-statistics',
  templateUrl: 'statistics.component.html',
})
export class StatisticsComponent extends AbstractTabComponent {
  public isPricingActive = false;

  public constructor(
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, [
      'consumption',
      'usage',
      'inactivity',
      'transactions',
      'pricing',
    ]);
    this.isPricingActive = this.componentService.isActive(TenantComponents.PRICING);
  }
}
