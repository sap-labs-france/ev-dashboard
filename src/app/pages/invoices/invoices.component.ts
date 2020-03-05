import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  constructor(
    activatedRoute: ActivatedRoute,
    authorizationService: AuthorizationService,
    windowService: WindowService) {
    super(activatedRoute, windowService, ['all']);
    this.isAdmin = authorizationService.isAdmin();
  }
}
