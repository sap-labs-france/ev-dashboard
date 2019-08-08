import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'app/services/authorization.service';

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
