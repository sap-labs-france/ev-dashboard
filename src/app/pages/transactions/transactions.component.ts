import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import { TenantComponents } from '../../types/Tenant';

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.component.html',
})
export class TransactionsComponent extends AbstractTabComponent {
  public canListTransactions: boolean;
  public canRefundTransaction: boolean;
  public canListTransactionsInError: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['inprogress', 'history', 'inerror', 'refund']);
    this.canListTransactions = this.authorizationService.canListTransactions();
    this.canListTransactionsInError = this.authorizationService.canListTransactionsInError();
    if (this.componentService.isActive(TenantComponents.REFUND)) {
      this.canRefundTransaction = this.authorizationService.canRefundTransaction();
    }
  }
}
