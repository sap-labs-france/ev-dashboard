import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import TenantComponents from '../../types/TenantComponents';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent extends AbstractTabComponent {
  public showTransactionRefundTab: boolean;
  public showTransactionInError: boolean;
  public showInvoices: boolean;

  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['inprogress', 'history', 'inerror', 'refund']);
    this.showTransactionRefundTab = this.componentService.isActive(TenantComponents.REFUND) &&
      (this.authorizationService.canRefundTransaction()
        || this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights());
    this.showTransactionInError = this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
    this.showInvoices = this.componentService.isActive(TenantComponents.BILLING);
  }
}
