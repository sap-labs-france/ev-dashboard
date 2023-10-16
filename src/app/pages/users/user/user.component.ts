import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { AuthorizationDefinitionFieldMetadata, DialogMode } from 'types/Authorization';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AbstractTabComponent } from '../../../shared/component/abstract-tab/abstract-tab.component';
import { Address } from '../../../types/Address';
import { ActionResponse } from '../../../types/DataResult';
import { RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { TenantComponents } from '../../../types/Tenant';
import { User, UserRole } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { UserMainComponent } from './main/user-main.component';
import { UserNotificationsComponent } from './notifications/user-notifications.component';
import { UserSecurityComponent } from './security/user-security.component';
import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'app-user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.scss'],
})
export class UserComponent extends AbstractTabComponent implements OnInit {
  @Input() public currentUserID!: string;
  @Input() public metadata!: Record<string, AuthorizationDefinitionFieldMetadata>;
  @Input() public dialogRef!: MatDialogRef<UserDialogComponent>;
  @Input() public dialogMode!: DialogMode;

  @ViewChild('userMainComponent') public userMainComponent!: UserMainComponent;
  @ViewChild('userNotificationsComponent')
  public userNotificationsComponent!: UserNotificationsComponent;
  @ViewChild('userSecurityComponent') public userSecurityComponent!: UserSecurityComponent;

  public isAdmin = false;
  public isSuperAdmin = false;
  public isBasic = false;
  public isSiteAdmin = false;

  public isBillingComponentActive: boolean;

  public user!: User;
  public address!: Address;

  public formGroup!: UntypedFormGroup;

  public canListPaymentMethods: boolean;

  public constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private router: Router,
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(
      activatedRoute,
      windowService,
      ['main', 'notifications', 'address', 'password', 'connections', 'miscs', 'billing'],
      false
    );
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    this.isBasic = this.authorizationService.isBasic();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // Set Tab IDs
    if (this.isBasic || this.isSiteAdmin) {
      this.setHashArray(['main', 'address', 'password', 'connections', 'miscs', 'billing']);
    }
    if (this.isSuperAdmin) {
      this.setHashArray(['main', 'notifications', 'address', 'password', 'miscs', 'billing']);
    }
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.canListPaymentMethods = this.authorizationService.canListPaymentMethods();
  }

  public updateRoute(event: number) {
    if (!this.dialogRef) {
      super.updateRoute(event);
    }
  }

  public ngOnInit() {
    if (this.activatedRoute.snapshot.url[0]?.path === 'profile') {
      this.currentUserID = this.centralServerService.getLoggedUser().id;
    }
    // Init the form
    this.formGroup = new UntypedFormGroup({});
    // Load
    this.loadUser();
    // Call parent Tab manager
    if (!this.dialogRef) {
      super.enableRoutingSynchronization();
    }
  }

  public loadUser() {
    if (this.currentUserID) {
      this.spinnerService.show();
      // eslint-disable-next-line complexity
      this.centralServerService.getUser(this.currentUserID).subscribe({
        next: (user) => {
          this.spinnerService.hide();
          this.user = user;
          // Update form group
          this.formGroup.updateValueAndValidity();
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
          if (user.address) {
            this.address = user.address;
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage('users.user_do_not_exist');
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'general.unexpected_error_backend'
              );
          }
        },
      });
    }
  }

  public refresh() {
    this.loadUser();
  }

  public saveUser(user: User) {
    if (this.currentUserID) {
      this.updateUser(user);
    } else {
      this.createUser(user);
    }
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.windowService.clearUrlParameter();
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(
      this.formGroup,
      this.dialogService,
      this.translateService,
      this.saveUser.bind(this),
      this.closeDialog.bind(this)
    );
  }

  public roleChanged(role: UserRole) {
    this.userNotificationsComponent?.roleChanged(role);
  }

  private createUser(user: User) {
    this.userMainComponent.updateUserImage(user);
    this.userSecurityComponent.updateUserPassword(user);
    this.spinnerService.show();
    this.centralServerService.createUser(user).subscribe({
      next: (response: ActionResponse) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('users.create_success', {
            userFullName: user.firstName + ' ' + user.name,
          });
          user.id = response.id ?? '';
          this.currentUserID = response.id ?? '';
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'users.create_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          // Email already exists
          case HTTPError.USER_EMAIL_ALREADY_EXIST_ERROR:
            this.messageService.showErrorMessage('authentication.email_already_exists');
            break;
          // User deleted
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('users.user_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'users.create_error'
            );
        }
      },
    });
  }

  private updateUser(user: User) {
    this.userMainComponent.updateUserImage(user);
    this.userSecurityComponent.updateUserPassword(user);
    this.spinnerService.show();
    this.centralServerService.updateUser(user).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage('users.update_success', {
            userFullName: user.firstName + ' ' + user.name,
          });
          this.closeDialog(true);
        } else {
          Utils.handleError(JSON.stringify(response), this.messageService, 'users.update_error');
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          // Email already exists
          case HTTPError.USER_EMAIL_ALREADY_EXIST_ERROR:
            this.messageService.showErrorMessage('authentication.email_already_exists');
            break;
          // User deleted
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('users.user_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'users.update_error'
            );
        }
      },
    });
  }
}
