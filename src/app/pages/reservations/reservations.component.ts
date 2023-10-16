import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'services/authorization.service';
import { ComponentService } from 'services/component.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';
import { TenantComponents } from 'types/Tenant';

@Component({
  selector: 'app-reservations',
  templateUrl: 'reservations.component.html',
})
export class ReservationsComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  public canListReservations: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['all', 'reservations']);
    this.isAdmin =
      this.authorizationService.isAdmin() || this.authorizationService.hasSitesAdminRights();
    if (this.componentService.isActive(TenantComponents.RESERVATION)) {
      this.canListReservations = this.authorizationService.canListReservations();
    }
  }
}
