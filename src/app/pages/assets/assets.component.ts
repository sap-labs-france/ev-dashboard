import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-assets',
  templateUrl: 'assets.component.html',
})
export class AssetsComponent extends AbstractTabComponent {
  public canListAssets: boolean;
  public canListAssetsInError: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['assets', 'inerror']);
    this.canListAssets = this.authorizationService.canListAssets();
    this.canListAssetsInError = this.authorizationService.canListAssetsInError();
  }
}
