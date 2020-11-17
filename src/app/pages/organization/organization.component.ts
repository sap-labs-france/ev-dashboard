import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
})
export class OrganizationComponent extends AbstractTabComponent {
  constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['companies', 'sites', 'site-areas']);
  }
}
