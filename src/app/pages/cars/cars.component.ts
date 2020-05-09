import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization.service';
import { WindowService } from 'app/services/window.service';
import { AbstractTabComponent } from 'app/shared/component/abstract-tab/abstract-tab.component';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
})
export class CarsComponent extends AbstractTabComponent {
  public isAdmin: boolean;
  public isBasic: boolean;

  constructor(
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
    authorizationService: AuthorizationService
  ) {
    super(activatedRoute, windowService, ['cars']);
    this.isAdmin = authorizationService.isAdmin();
    this.isBasic = authorizationService.isBasic();
  }
}
