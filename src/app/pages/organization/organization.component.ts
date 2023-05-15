import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'services/authorization.service';

import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-organization',
  templateUrl: 'organization.component.html',
})
export class OrganizationComponent extends AbstractTabComponent {
  public canListCompanies = false;
  public canListSites = false;
  public canListSiteAreas = false;

  public constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
    authorizationService: AuthorizationService
  ) {
    super(activatedRoute, windowService, ['companies', 'sites', 'site-areas']);
    this.canListCompanies = authorizationService.canListCompanies();
    this.canListSites = authorizationService.canListSites();
    this.canListSiteAreas = authorizationService.canListSiteAreas();
  }
}
