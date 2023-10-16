import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-tags',
  templateUrl: 'tags.component.html',
})
export class TagsComponent extends AbstractTabComponent {
  public canListTags: boolean;

  public constructor(
    activatedRoute: ActivatedRoute,
    authorizationService: AuthorizationService,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['all']);
    this.canListTags = authorizationService.canListTags();
  }
}
