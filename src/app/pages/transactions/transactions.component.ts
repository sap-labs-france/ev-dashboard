import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Actions, Entities } from 'app/types/Authorization';
import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService, ComponentType } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';
import { Constants } from '../../utils/Constants';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent extends AbstractTabComponent {
  public showTransactionRefundTab: boolean;
  public showTransactionInError: boolean;

  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['history', 'inprogress', 'inerror', 'refund']);
    this.showTransactionRefundTab = this.componentService.isActive(ComponentType.REFUND) &&
      (this.authorizationService.canAccess(Entities.TRANSACTION, Actions.REFUND_TRANSACTION)
        || this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights());
    this.showTransactionInError = this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
  }
}
