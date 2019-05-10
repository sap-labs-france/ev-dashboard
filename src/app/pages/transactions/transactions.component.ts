import {Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {AuthorizationService} from '../../services/authorization-service';
import {ComponentEnum, ComponentService} from '../../services/component.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent extends AbstractTabComponent {

  constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['history', 'inprogress', 'inerror', 'refund']);
  }

  canAccessRefund() {
    return this.componentService.isActive(ComponentEnum.REFUND);
  }

  canAccessInErrorTab() {
    return this.authorizationService.isAdmin();
  }

}
