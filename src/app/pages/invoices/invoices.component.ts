import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-invoices',
  templateUrl: 'invoices.component.html',
})
export class InvoicesComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  public canListTransfers: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['all', 'transfers']);
    this.isAdmin =
      this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
    if (this.componentService.isActive(TenantComponents.BILLING_PLATFORM)) {
      this.canListTransfers = this.authorizationService.canListTransfers();
    }
  }
}
