import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { RestResponse } from '../../types/GlobalType';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-define-password',
  templateUrl: 'authentication-define-password.component.html',
})
export class AuthenticationDefinePasswordComponent implements OnInit, OnDestroy {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public formGroup: UntypedFormGroup;
  public resetPasswordHash!: string | null;
  public passwords: UntypedFormGroup;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public hidePassword = true;
  public hideRepeatPassword = true;
  public mobileVendor!: string;
  public tenantLogo = Constants.NO_IMAGE;

  private subDomain: string;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private windowService: WindowService,
    private configService: ConfigService
  ) {
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Init Form
    this.formGroup = new UntypedFormGroup({
      passwords: new UntypedFormGroup(
        {
          password: new UntypedFormControl(
            '',
            Validators.compose([
              Validators.required,
              Users.passwordWithNoSpace,
              Users.validatePassword,
            ])
          ),
          repeatPassword: new UntypedFormControl('', Validators.compose([Validators.required])),
        },
        (passwordFormGroup: UntypedFormGroup) =>
          Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword')
      ),
    });
    // Form
    this.passwords = this.formGroup.controls['passwords'] as UntypedFormGroup;
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.resetPasswordHash = this.route.snapshot.queryParamMap.get('hash');
    // Handle Deep Linking
    if (Utils.isInMobileApp(this.subDomain)) {
      // Forward to Mobile App
      const mobileAppURL = Utils.buildMobileAppDeepLink(
        `resetPassword/${this.windowService.getSubdomain()}/${this.resetPasswordHash}`
      );
      window.location.href = mobileAppURL;
    }
    setTimeout(() => {
      const card = document.getElementsByClassName('card')[0];
      // After 700 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  public ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
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

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public resetPassword(data: any) {
    data['hash'] = this.resetPasswordHash;
    this.updatePassword(data);
    this.spinnerService.show();
    this.centralServerService.resetUserPassword(data).subscribe((response) => {
      this.spinnerService.hide();
      if (response.status && response.status === RestResponse.SUCCESS) {
        // Show message
        this.messageService.showSuccessMessage('authentication.define_password_success');
        // Go back to login
        void this.router.navigate(['/auth/login']);
      } else {
        Utils.handleError(
          JSON.stringify(response),
          this.messageService,
          'authentication.define_password_error'
        );
      }
    });
  }

  private updatePassword(data: any) {
    if (data['passwords'] && data['passwords']['password']) {
      data['password'] = data['passwords']['password'];
      delete data['passwords'];
    }
  }
}
