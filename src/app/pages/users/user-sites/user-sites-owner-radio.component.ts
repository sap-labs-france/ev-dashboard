import { Component, Input, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { RestResponse } from '../../../types/GlobalType';
import { UserSite } from '../../../types/Site';
import { User, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  template: `
    <div class="d-flex justify-content-center">
      <mat-checkbox class="mx-auto"
        [checked]="(row.siteOwner ? row.siteOwner : false)"
        [disabled]="(!loggedUser.sitesAdmin.includes(row.site.id) && loggedUser.role !== 'A') || (user && user.role === 'A')"
        (change)="changeSiteOwner($event)">
      </mat-checkbox>
    </div>`
})

export class UserSitesOwnerRadioComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: UserSite;
  public loggedUser: UserToken;
  public user: User;

  public constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public ngOnInit(): void {
    this.centralServerService.getUser(this.row.userID).subscribe((user) => {
      this.user = user;
    });
  }

  public changeSiteOwner(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteOwner(this.row, matCheckboxChange.checked);
    }
  }

  private setUserSiteOwner(userSite: UserSite, siteOwner: boolean) {
    // Update
    this.centralServerService.updateSiteOwner(userSite.site.id, userSite.userID, siteOwner).subscribe((response) => {
      if (response.status === RestResponse.SUCCESS) {
        if (siteOwner) {
          this.messageService.showSuccessMessage('users.update_set_site_owner_success', {siteName: userSite.site.name});
        } else {
          this.messageService.showSuccessMessage('users.update_remove_site_owner_success', {siteName: userSite.site.name});
        }
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, 'users.update_site_users_owner_error', {
            siteName: userSite.site.name,
          });
      }
    }
    ,
    (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'users.update_site_users_owner_error', {siteName: userSite.site.name});
    },
    );
  }
}
