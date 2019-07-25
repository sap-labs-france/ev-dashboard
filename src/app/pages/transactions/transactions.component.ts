import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from '../../services/authorization-service';
import { ComponentEnum, ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/tab/AbstractTab.component';
import { Constants } from '../../utils/Constants';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent extends AbstractTabComponent {
  public showTransactionRefundTab: boolean;
  public showTransactionInError: boolean;

  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['history', 'inprogress', 'inerror', 'refund']);
    this.showTransactionRefundTab = this.componentService.isActive(ComponentEnum.REFUND);
    this.showTransactionInError = this.authorizationService.canAccess(Constants.ENTITY_TRANSACTION, Constants.ACTION_DELETE);
  }
}
