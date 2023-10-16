import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'services/authorization.service';
import { WindowService } from 'services/window.service';
import { AbstractTabComponent } from 'shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-settings-technical',
  templateUrl: 'settings-technical.component.html',
})
export class SettingsTechnicalComponent extends AbstractTabComponent {
  public canReadTenant: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['organization', 'crypto', 'users']);
    this.canReadTenant = this.authorizationService.canReadTenant();
  }
}
