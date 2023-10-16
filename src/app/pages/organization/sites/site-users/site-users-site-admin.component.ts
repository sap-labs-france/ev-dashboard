import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { Site } from 'types/Site';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { CellContentTemplateDirective } from '../../../../shared/table/cell-content-template/cell-content-template.directive';
import { RestResponse } from '../../../../types/GlobalType';
import { SiteUser, UserRole, UserToken } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

@Component({
  template: ` <div class="d-flex justify-content-center">
    <mat-checkbox
      class="mx-auto"
      [checked]="row?.siteAdmin || row?.user?.role === UserRole.ADMIN"
      [disabled]="
        (!isSiteAdmin && loggedUser.role !== UserRole.ADMIN) ||
        columnDef.disabled ||
        row?.user?.role === UserRole.ADMIN
      "
      (change)="changeSiteAdmin($event)"
    >
    </mat-checkbox>
  </div>`,
})
export class SiteUsersSiteAdminComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: SiteUser;
  public loggedUser: UserToken;
  public site: Site;
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

  public ngOnInit(): void {
    this.site = this.columnDef.additionalParameters.site;
    this.isSiteAdmin = this.loggedUser.sitesAdmin.includes(this.site.id);
  }

  public changeSiteAdmin(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteAdmin(this.row, matCheckboxChange.checked);
    }
  }

  private setUserSiteAdmin(siteUser: SiteUser, siteAdmin: boolean) {
    // Set
    siteUser.siteAdmin = siteAdmin;
    // Update
    this.centralServerService
      .updateSiteUserAdmin(siteUser.siteID, siteUser.user.id, siteAdmin)
      .subscribe(
        (response) => {
          if (response.status === RestResponse.SUCCESS) {
            if (siteAdmin) {
              this.messageService.showSuccessMessage('sites.update_set_site_admin_success', {
                userName: Utils.buildUserFullName(siteUser.user),
              });
            } else {
              this.messageService.showSuccessMessage('sites.update_remove_site_admin_success', {
                userName: Utils.buildUserFullName(siteUser.user),
              });
            }
          } else {
            siteUser.siteAdmin = !siteAdmin;
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              'sites.update_site_users_role_error',
              {
                userName: siteUser.user.name,
              }
            );
          }
        },
        (error) => {
          siteUser.siteAdmin = !siteAdmin;
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'sites.update_site_users_role_error',
            { userName: siteUser.user.name }
          );
        }
      );
  }
}
