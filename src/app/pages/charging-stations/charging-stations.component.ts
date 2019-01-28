import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';

@Component({
  templateUrl: 'charging-stations.component.html'
})
export class ChargingStationsComponent extends AbstractTabComponent implements OnInit {
  isAdmin: boolean;
  constructor (
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['all', 'inerror']);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
  }
}
