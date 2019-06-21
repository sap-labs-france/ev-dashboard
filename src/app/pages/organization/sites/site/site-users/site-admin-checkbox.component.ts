import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { Router } from '@angular/router';
import { Site, User } from '../../../../../common.types';
import { CentralServerService } from '../../../../../services/central-server.service';
import { MessageService } from '../../../../../services/message.service';
import { CellContentTemplateComponent } from '../../../../../shared/table/cell-content-template/cell-content-template.component';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto" [checked]="row.role === 'A'" (change)="changeSiteUserRole($event)"></mat-checkbox>
    </div>`
})
export class SiteAdminCheckboxComponent extends CellContentTemplateComponent {
  @Input() row: User;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
  }

  public changeSiteUserRole(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.changeSiteAdminRole(this.row, matCheckboxChange.checked);
    }
  }

  private getSite(): Site {
    if (this.columnDef && this.columnDef.additionalData) {
      return this.columnDef.additionalData();
    }
  }

  private changeSiteAdminRole(user: User, admin: boolean) {
    const previousRole = user.role;
    const role = admin ? Constants.USER_ROLE_ADMIN : Constants.USER_ROLE_BASIC;
    const site = this.getSite();
    user.role = role;
    this.centralServerService.updateSiteUserRole(site.id, user.id, role).subscribe(response => {
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          if (admin) {
            this.messageService.showSuccessMessage('sites.update_set_site_admin_success', {'site': site.name, 'userName': user.name});
          } else {
            this.messageService.showSuccessMessage('sites.update_remove_site_admin_success', {'site': site.name, 'userName': user.name});
          }
        } else {
          user.role = previousRole;
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'sites.update_site_users_role_error', {
              'userName': user.name
            });
        }
      }
      ,
      (error) => {
        user.role = previousRole;
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'sites.update_site_users_role_error', {'userName': user.name});
      }
    );
  }
}
