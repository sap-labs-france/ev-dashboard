import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {AuthorizationService} from '../../services/authorization-service';
import {Constants} from '../../utils/Constants';
import {CentralServerService} from '../../services/central-server.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: ['.transactions app-detail-component-container{width: 100%}']
})
export class TransactionsComponent extends AbstractTabComponent implements OnInit {

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['history', 'inprogress', 'inerror', 'chargeathome']);
  }

  ngOnInit() {
  }

  canAccessChargeAtHome() {
    return this.authorizationService.canRefundTransaction() && this.centralServerService.isComponentActive(Constants.SETTINGS_CHARGE_AT_HOME);
  }
}
