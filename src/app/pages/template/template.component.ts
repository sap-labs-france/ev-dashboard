import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization-service';
import {AbstractTabComponent} from '../../shared/component/tab/AbstractTab.component';
import {ActivatedRoute} from '@angular/router';
import {WindowService} from '../../services/window.service';

@Component({
  templateUrl: 'template.component.html'
})
export class TemplateComponent {
  isAdmin: boolean;
  constructor (
    private authorizationService: AuthorizationService
  ) {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }
}
