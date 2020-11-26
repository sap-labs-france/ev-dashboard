import { Component } from '@angular/core';

import { AuthorizationService } from '../../services/authorization.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  templateUrl: 'template.component.html',
})
export class TemplateComponent {
  public isAdmin: boolean;
  constructor(
    public spinnerService: SpinnerService,
    private authorizationService: AuthorizationService,
  ) {
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.spinnerService.hide();
  }
}
