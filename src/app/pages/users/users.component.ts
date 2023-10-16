import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-users',
  templateUrl: 'users.component.html',
})
export class UsersComponent extends AbstractTabComponent {
  public canListUsers: boolean;
  public canListUsersInError: boolean;

  public constructor(
    activatedRoute: ActivatedRoute,
    authorizationService: AuthorizationService,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['all', 'inerror']);
    this.canListUsers = authorizationService.canListUsers();
    this.canListUsersInError = authorizationService.canListUsersInError();
  }
}
