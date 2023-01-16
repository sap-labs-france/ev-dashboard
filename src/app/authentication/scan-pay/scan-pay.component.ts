import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';

import { AuthorizationService } from '../../services/authorization.service';
import { ComponentService } from '../../services/component.service';
import { WindowService } from '../../services/window.service';
import { TenantComponents } from '../../types/Tenant';

@Component({
  selector: 'app-scan-pay',
  templateUrl: 'scan-pay.component.html',
  // styleUrls: ['tenant.component.scss']
})
export class ScanPayComponent extends AbstractTabComponent{
  @Input() public transactionID!: number;

  public canListTransactions: boolean;
  public canRefundTransaction: boolean;
  public canListTransactionsInError: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute, windowService: WindowService) {
    super(activatedRoute, windowService, ['inprogress', 'history', 'inerror', 'refund']);
  }
}
