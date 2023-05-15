import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ButtonAction } from 'types/GlobalType';
import { User } from 'types/User';

import { AuthorizationService } from '../../services/authorization.service';
import { CentralServerService } from '../../services/central-server.service';
import { DialogService } from '../../services/dialog.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { HTTPError } from '../../types/HTTPError';
import { Constants } from '../../utils/Constants';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

declare let $: any;

@Component({
  selector: 'app-authentication-login',
  templateUrl: 'authentication-login.component.html',
})
export class AuthenticationLoginComponent implements OnInit, OnDestroy {
  public formGroup: UntypedFormGroup;
  public email: AbstractControl;
  public returnUrl!: string;
  public password: AbstractControl;
  public acceptEula: AbstractControl;

  public hidePassword = true;
  public tenantLogo = Constants.NO_IMAGE;

  private toggleButton: any;
  private sidebarVisible: boolean;
  private messages!: Record<string, string>;
  private subDomain: string;
  private nativeElement: Node;

  public constructor(
    private element: ElementRef,
    private centralServerService: CentralServerService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private windowService: WindowService,
    private translateService: TranslateService,
    private authorizationService: AuthorizationService
  ) {
    // Reset the spinner
    this.spinnerService.hide();
    // Set
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    // Load the translated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Init Form
    this.formGroup = new UntypedFormGroup({
      email: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.email])
      ),
      password: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Users.passwordWithNoSpace])
      ),
      acceptEula: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    // Get controls
    this.email = this.formGroup.controls['email'];
    this.password = this.formGroup.controls['password'];
    this.acceptEula = this.formGroup.controls['acceptEula'];
    // Check URL params
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.email.setValue(email);
    }
    setTimeout(() => {
      const card = document.getElementsByClassName('card')[0];
      // After 700 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  public ngOnInit() {
    this.dialog.closeAll();
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('login-page');
    body.classList.add('off-canvas-sidebar');
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.route.snapshot.fragment) {
      this.returnUrl += `#${this.route.snapshot.fragment}`;
    }
    // Auto Logon in case of demo users
    const email = this.route.snapshot.queryParamMap.get('email');
    const password = this.route.snapshot.queryParamMap.get('password');
    if (email === 'demo.demo@sap.com' && password) {
      this.email.setValue(email);
      this.password.setValue(password);
      this.acceptEula.setValue('true');
      this.login(this.formGroup.value);
    }
    if (this.subDomain) {
      // Retrieve tenant's logo
      this.centralServerService.getTenantLogoBySubdomain(this.subDomain).subscribe({
        next: (tenantLogo: string) => {
          if (tenantLogo) {
            this.tenantLogo = tenantLogo;
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case StatusCodes.NOT_FOUND:
              this.tenantLogo = Constants.NO_IMAGE;
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
    } else {
      this.tenantLogo = Constants.MASTER_TENANT_LOGO;
    }
  }

  public sidebarToggle() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      setTimeout(() => {
        toggleButton.classList.add('toggled');
      }, 500);
      body.classList.add('nav-open');
      this.sidebarVisible = true;
    } else {
      this.toggleButton.classList.remove('toggled');
      this.sidebarVisible = false;
      body.classList.remove('nav-open');
    }
  }

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('login-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public login(user: User): void {
    this.spinnerService.show();
    // clear User and UserAuthorization
    this.authorizationService.cleanUserAndUserAuthorization();
    // Login
    this.centralServerService.login(user).subscribe({
      next: (result) => {
        this.spinnerService.hide();
        this.centralServerService.loginSucceeded(result.token);
        // login successful so redirect to return url
        void this.router.navigateByUrl(this.returnUrl as string);
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          // Wrong email or password
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage(this.messages['wrong_email_or_password']);
            break;
          // Account is locked
          case HTTPError.USER_ACCOUNT_LOCKED_ERROR:
            this.messageService.showErrorMessage(this.messages['account_locked']);
            break;
          // Account is inactive
          case HTTPError.USER_ACCOUNT_INACTIVE_ERROR:
            this.messageService.showErrorMessage(this.messages['account_inactive']);
            break;
          // Account Suspended
          case HTTPError.USER_ACCOUNT_BLOCKED_ERROR:
            this.messageService.showErrorMessage(this.messages['account_suspended']);
            break;
          // API User
          case HTTPError.TECHNICAL_USER_CANNOT_LOG_TO_UI_ERROR:
            this.messageService.showErrorMessage(
              this.messages['technical_user_cannot_login_to_ui']
            );
            break;
          // Account Pending
          case HTTPError.USER_ACCOUNT_PENDING_ERROR:
            // Pending Users from the Super Tenant should not be able to request an activation email
            if (!Utils.isEmptyString(this.subDomain)) {
              // Usual Users
              this.messageService.showWarningMessage(this.messages['account_pending']);
              // No Create and show dialog data
              this.dialogService
                .createAndShowYesNoDialog(
                  this.translateService.instant('authentication.verify_email_title'),
                  this.translateService.instant('authentication.verify_email_resend_confirm')
                )
                .subscribe((response) => {
                  if (response === ButtonAction.YES) {
                    void this.router.navigate(['/auth/verify-email'], {
                      queryParams: { Email: user['email'] },
                    });
                  }
                });
            } else {
              // Super Admin Users
              this.messageService.showWarningMessage(this.messages['super_user_account_pending']);
            }
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
