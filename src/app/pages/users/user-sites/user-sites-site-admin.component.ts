import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { RestResponse } from '../../../types/GlobalType';
import { UserSite } from '../../../types/Site';
import { User, UserRole, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  template: ` <div class="d-flex justify-content-center">
    <mat-checkbox
      class="mx-auto"
      [checked]="row?.siteAdmin || user?.role === UserRole.ADMIN"
      [disabled]="
        (!isSiteAdmin && loggedUser.role !== UserRole.ADMIN) ||
        columnDef.disabled ||
        user?.role === UserRole.ADMIN
      "
      (change)="changeSiteAdmin($event)"
    >
    </mat-checkbox>
  </div>`,
})
export class UserSitesSiteAdminComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: UserSite;
  public loggedUser: UserToken;
  public user: User;
  public isSiteAdmin: boolean;
  public readonly UserRole = UserRole;

  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router
  ) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteAdmin(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteAdmin(this.row, matCheckboxChange.checked);
    }
  }

  public ngOnInit(): void {
    this.user = this.columnDef.additionalParameters.user;
    this.isSiteAdmin = this.loggedUser.sitesAdmin.includes(this.row.site.id);
  }

  private setUserSiteAdmin(userSite: UserSite, siteAdmin: boolean) {
    // Set
    userSite.siteAdmin = siteAdmin;
    // Update
    this.centralServerService
      .updateSiteUserAdmin(userSite.site.id, userSite.userID, siteAdmin)
      .subscribe(
        (response) => {
          if (response.status === RestResponse.SUCCESS) {
            if (siteAdmin) {
              this.messageService.showSuccessMessage('users.update_set_site_admin_success', {
                siteName: userSite.site.name,
              });
            } else {
              this.messageService.showSuccessMessage('users.update_remove_site_admin_success', {
                siteName: userSite.site.name,
              });
            }
          } else {
            userSite.siteAdmin = !siteAdmin;
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              'users.update_site_admin_role_error',
              { siteName: userSite.site.name }
            );
          }
        },
        (error) => {
          userSite.siteAdmin = !siteAdmin;
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'users.update_site_admin_role_error',
            { siteName: userSite.site.name }
          );
        }
      );
  }
}
