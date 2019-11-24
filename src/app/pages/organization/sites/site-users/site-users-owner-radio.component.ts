import { Component, Input } from '@angular/core';
import { MatCheckboxChange } from '@angular/material';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { User, UserSite, UserToken } from '../../../../common.types';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { CellContentTemplateComponent } from '../../../../shared/table/cell-content-template/cell-content-template.component';
import { Constants } from '../../../../utils/Constants';
import { Utils } from '../../../../utils/Utils';

@Component({
  template: `
      <div class="d-flex justify-content-center">
          <mat-radio-button class="mx-auto"
                            [checked]="(row.siteOwner ? row.siteOwner : false)"
                            (change)="changeSiteOwner($event)"></mat-radio-button>
      </div>`,
})
export class SiteUsersOwnerRadioComponent extends CellContentTemplateComponent {
  @Input() row!: UserSite;
  public loggedUser: UserToken;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteOwner(matRadioChange: MatRadioChange) {
    if (matRadioChange) {
      this.setUserSiteOwner(this.row);
    }
  }

  private setUserSiteOwner(userSite: UserSite) {
    // Update
    this.centralServerService.updateSiteOwner(userSite.siteID, userSite.user.id).subscribe((response) => {
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          this.messageService.showSuccessMessage('sites.update_set_site_owner_success', { userName: Utils.buildUserFullName(userSite.user) });
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'sites.update_site_users_owner_error', {
              userName: Utils.buildUserFullName(userSite.user),
            });
        }
      }
      ,
      (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          'sites.update_site_users_owner_error', {userName: userSite.user.name});
      },
    );
  }
}
