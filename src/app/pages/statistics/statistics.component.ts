import { Component, ViewEncapsulation } from '@angular/core';
import { AbstractTabComponent } from '../../shared/component/tab/AbstractTab.component';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { AuthorizationService } from '../../services/authorization-service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent extends AbstractTabComponent {
  isAdmin: boolean;
  constructor(
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['consumption', 'usage']);
    this.isAdmin = this.authorizationService.isAdmin();
  }
}
