import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatRadioButton, MatRadioChange } from '@angular/material/radio';
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
    <mat-radio-button
      #rbid
      class="mx-auto"
      [checked]="row?.siteOwner"
      [disabled]="(!isSiteAdmin && loggedUser.role !== UserRole.ADMIN) || columnDef.disabled"
      (change)="changeRadioButton($event)"
    >
    </mat-radio-button>
  </div>`,
})
export class SiteUsersSiteOwnerComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: SiteUser;
  @ViewChild('rbid') public radioButtonRef!: MatRadioButton;
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

  public changeRadioButton(matRadioChange: MatRadioChange) {
    // uncheck the previous siteOwner
    this.radioButtonRef.checked = !this.radioButtonRef.checked;
    // check the new siteOwner
    matRadioChange.source.checked = !matRadioChange.source.checked;
    // update in db
    this.setUserSiteOwner(this.row, this.radioButtonRef.checked);
  }

  private setUserSiteOwner(siteUser: SiteUser, siteOwner: boolean) {
    // Update
    this.centralServerService
      .updateSiteOwner(siteUser.siteID, siteUser.user.id, siteOwner)
      .subscribe(
        (response) => {
          if (response.status === RestResponse.SUCCESS) {
            if (siteOwner) {
              this.messageService.showSuccessMessage('sites.update_set_site_owner_success', {
                userName: Utils.buildUserFullName(siteUser.user),
              });
            } else {
              this.messageService.showSuccessMessage('sites.update_remove_site_owner_success', {
                userName: Utils.buildUserFullName(siteUser.user),
              });
            }
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              'sites.update_site_users_owner_error',
              {
                userName: Utils.buildUserFullName(siteUser.user),
              }
            );
          }
        },
        (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'sites.update_site_users_owner_error',
            { userName: Utils.buildUserFullName(siteUser.user) }
          );
        }
      );
  }
}
