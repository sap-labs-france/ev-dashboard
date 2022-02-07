import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinnerService } from 'services/spinner.service';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
})
export class CarsComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  public isBasic: boolean;

  public constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
    authorizationService: AuthorizationService,
    spinnerService: SpinnerService
  ) {
    super(activatedRoute, windowService, ['cars', 'carcatalogs']);
    this.isAdmin = authorizationService.isAdmin();
    this.isBasic = authorizationService.isBasic();
    spinnerService.hide();
  }
}
