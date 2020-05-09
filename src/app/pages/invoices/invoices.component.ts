import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { WindowService } from 'app/services/window.service';
import { AbstractTabComponent } from 'app/shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  constructor(
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['invoices', 'inerror']);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
  }
}
