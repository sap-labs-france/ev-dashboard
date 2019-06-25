import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { Router } from '@angular/router';
import { Site, User, UserSite } from '../../../../../common.types';
import { CentralServerService } from '../../../../../services/central-server.service';
import { MessageService } from '../../../../../services/message.service';
import { CellContentTemplateComponent } from '../../../../../shared/table/cell-content-template/cell-content-template.component';
import { Constants } from '../../../../../utils/Constants';
import { Utils } from '../../../../../utils/Utils';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto"
        [disabled]="row.role !== 'B'"
        [checked]="(row.role ? row.siteAdmin : false) || row.role === 'A'" (change)="changeSiteAdmin($event)"></mat-checkbox>
    </div>`
})
export class SiteAdminCheckboxComponent extends CellContentTemplateComponent {
  @Input() row: UserSite;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
  }

  public changeSiteAdmin(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteAdmin(this.row, matCheckboxChange.checked);
    }
  }

  private getSite(): Site {
    if (this.columnDef && this.columnDef.additionalData) {
      return this.columnDef.additionalData();
    }
  }

  private setUserSiteAdmin(user: UserSite, siteAdmin: boolean) {
    const site = this.getSite();
    user.siteAdmin = siteAdmin;
    this.centralServerService.updateSiteUserAdmin(site.id, user.id, siteAdmin).subscribe(response => {
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          if (siteAdmin) {
            this.messageService.showSuccessMessage('sites.update_set_site_admin_success', {'site': site.name, 'userName': user.name});
          } else {
            this.messageService.showSuccessMessage('sites.update_remove_site_admin_success', {'site': site.name, 'userName': user.name});
          }
        } else {
          user.siteAdmin = !siteAdmin;
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'sites.update_site_users_role_error', {
              'userName': user.name
            });
        }
      }
      ,
      (error) => {
        user.siteAdmin = !siteAdmin;
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'sites.update_site_users_role_error', {'userName': user.name});
      }
    );
  }
}
