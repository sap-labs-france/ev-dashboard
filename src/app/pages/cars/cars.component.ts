import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'services/spinner.service';
import { FiltersService } from 'shared/filters/filters.service';
import { FilterHttpIDs } from 'types/Filters';
import { AssetInErrorType } from 'types/InError';

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
    authorizationService: AuthorizationService
  ) {
    super(activatedRoute, windowService, ['cars', 'carcatalogs']);
    this.isAdmin = authorizationService.isAdmin();
    this.isBasic = authorizationService.isBasic();
  }
}
