import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { RestResponse } from '../../../../types/GlobalType';
import { UserSite, UserToken } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto"
        [disabled]="row.user.role !== 'B' || loggedUser.id === row.user.id"
        [checked]="(row.siteAdmin ? row.siteAdmin : false) || row.user.role === 'A'" (change)="changeSiteAdmin($event)"></mat-checkbox>
    </div>`,
})
export class SiteUsersAdminCheckboxComponent extends CellContentTemplateDirective {
  @Input() public row!: UserSite;
  public loggedUser: UserToken;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteAdmin(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteAdmin(this.row, matCheckboxChange.checked);
    }
  }

  private setUserSiteAdmin(userSite: UserSite, siteAdmin: boolean) {
    // Set
    userSite.siteAdmin = siteAdmin;
    // Update
    this.centralServerService.updateSiteUserAdmin(userSite.siteID, userSite.user.id, siteAdmin).subscribe((response) => {
        if (response.status === RestResponse.SUCCESS) {
          if (siteAdmin) {
            this.messageService.showSuccessMessage('sites.update_set_site_admin_success', {userName: Utils.buildUserFullName(userSite.user)});
          } else {
            this.messageService.showSuccessMessage('sites.update_remove_site_admin_success', {userName: Utils.buildUserFullName(userSite.user)});
          }
        } else {
          userSite.siteAdmin = !siteAdmin;
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'sites.update_site_users_role_error', {
              userName: userSite.user.name,
            });
        }
      }
      ,
      (error) => {
        userSite.siteAdmin = !siteAdmin;
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'sites.update_site_users_role_error', {userName: userSite.user.name});
      },
    );
  }
}
