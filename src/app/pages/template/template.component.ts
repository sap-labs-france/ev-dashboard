import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';

@Component({
  templateUrl: 'template.component.html'
})
export class TemplateComponent implements OnInit {
  isAdmin: boolean;
  constructor (
    private authorizationService: AuthorizationService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService
  ) {
    // super(activatedRoute, windowService, ['all', 'inerror']);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  ngOnInit() {
  }
}
