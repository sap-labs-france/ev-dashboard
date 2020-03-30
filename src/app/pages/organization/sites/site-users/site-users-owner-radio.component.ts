import { Component, Input, ViewChild } from '@angular/core';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { RestResponse } from 'app/types/GlobalType';
import { UserSite } from 'app/types/Site';
import { UserToken } from 'app/types/User';
import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { CellContentTemplateComponent } from '../../../../shared/table/cell-content-template/cell-content-template.component';
import { Utils } from '../../../../utils/Utils';

@Component({
  template: `
      <div class="d-flex justify-content-center">
          <mat-radio-button #rbid class="mx-auto"
                            [checked]="(row.siteOwner ? true : false)"
                            (change) = "changeRadioButton($event)"
                            (click) = "changeSiteOwner()"></mat-radio-button>
      </div>`,
})
export class SiteUsersOwnerRadioComponent extends CellContentTemplateComponent {
  @Input() row!: UserSite;
  @ViewChild('rbid') radioButtonRef!: MatRadioButton;
  public loggedUser: UserToken;

  constructor(
    private messageService: MessageService,
    private centralServerService: CentralServerService,
    private router: Router) {
    super();
    this.loggedUser = centralServerService.getLoggedUser();
  }

  public changeSiteOwner() {
    this.radioButtonRef.checked = !this.radioButtonRef.checked;
    this.setUserSiteOwner(this.row, this.radioButtonRef.checked);
  }

  public changeRadioButton(matRadioChange: MatRadioChange) {
      matRadioChange.source.checked  = !matRadioChange.source.checked;
  }

  private setUserSiteOwner(userSite: UserSite, siteOwner: boolean) {
    // Update
    this.centralServerService.updateSiteOwner(userSite.siteID, userSite.user.id, siteOwner).subscribe((response) => {
        if (response.status === RestResponse.SUCCESS) {
          if (siteOwner) {
            this.messageService.showSuccessMessage('sites.update_set_site_owner_success', {userName: Utils.buildUserFullName(userSite.user)});
          } else {
            this.messageService.showSuccessMessage('sites.update_remove_site_owner_success', {userName: Utils.buildUserFullName(userSite.user)});
          }
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
          'sites.update_site_users_owner_error', {userName: Utils.buildUserFullName(userSite.user)});
      },
    );
  }
}
