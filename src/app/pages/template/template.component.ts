import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from 'app/services/authorization-service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/tab/AbstractTab.component';

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
