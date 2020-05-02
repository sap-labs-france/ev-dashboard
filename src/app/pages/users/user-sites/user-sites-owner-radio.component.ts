import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { SiteUser } from 'app/types/Site';
import { UserToken } from 'app/types/User';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { Utils } from '../../../utils/Utils';

@Component({
  template: `
      <div class="d-flex justify-content-center">
          <mat-checkbox class="mx-auto"
                            [checked]="(row.siteOwner ? row.siteOwner : false)"
                            (change)="changeSiteOwner($event)"></mat-checkbox>
      </div>`,
})
export class UserSitesOwnerRadioComponent extends CellContentTemplateComponent {
  @Input() public row!: SiteUser;
  public loggedUser: UserToken;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteOwner(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.setUserSiteOwner(this.row, matCheckboxChange.checked);
    }
  }

  private setUserSiteOwner(siteUser: SiteUser, siteOwner: boolean) {
    // Update
    this.centralServerService.updateSiteOwner(siteUser.site.id, siteUser.userID, siteOwner).subscribe((response) => {
        if (response.status === RestResponse.SUCCESS) {
          if (siteOwner) {
            this.messageService.showSuccessMessage('users.update_set_site_owner_success', {siteName: siteUser.site.name});
          } else {
            this.messageService.showSuccessMessage('users.update_remove_site_owner_success', {siteName: siteUser.site.name});
          }
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'users.update_site_users_owner_error', {
              siteName: siteUser.site.name,
            });
        }
      }
      ,
      (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'users.update_site_users_owner_error', {siteName: siteUser.site.name});
      },
    );
  }
}
