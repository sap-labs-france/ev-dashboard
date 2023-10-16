import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { UserStatus } from 'types/User';

import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { VerifyEmailResponse } from '../../types/DataResult';
import { RestResponse } from '../../types/GlobalType';
import { HTTPError } from '../../types/HTTPError';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-verify-email',
  templateUrl: 'authentication-verify-email.component.html',
})
export class AuthenticationVerifyEmailComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public formGroup: UntypedFormGroup;
  public verifyEmailAction!: boolean;
  public verificationToken: string | null;
  public resetToken: string | null;
  public verificationEmail: string | null;

  public tenantLogo = Constants.NO_IMAGE;

  private messages!: Record<string, string>;

  private siteKey: string;
  private subDomain: string;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private windowService: WindowService,
    private translateService: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private configService: ConfigService
  ) {
    // Load the translated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    // Init Form
    this.formGroup = new UntypedFormGroup({
      email: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.email])
      ),
    });
    // Form
    this.email = this.formGroup.controls['email'];
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Get verificationToken & email
    this.verificationToken = this.route.snapshot.queryParamMap.get('VerificationToken');
    this.resetToken = this.route.snapshot.queryParamMap.get('ResetToken');
    this.verificationEmail = this.route.snapshot.queryParamMap.get('Email');
    // Handle Deep Linking
    if (Utils.isInMobileApp(this.subDomain)) {
      // Forward to Mobile App
      const mobileAppURL: string = Utils.buildMobileAppDeepLink(
        `verifyAccount/${this.windowService.getSubdomain()}/${this.verificationEmail}/${
          this.verificationToken
        }/${this.resetToken}`
      );
      // ACHTUNG ! hack for email bug sent 800 times - need to find a
      // window.location.href = mobileAppURL;
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
    // Check email
    if (this.verificationEmail) {
      // Set email
      this.formGroup.controls.email.setValue(this.verificationEmail);
      // Check if verificationToken
      if (this.verificationToken) {
        // Disable resend verification email
        this.verifyEmailAction = true;
        // Verify Email
        this.verifyEmail({
          email: this.verificationEmail,
          verificationToken: this.verificationToken,
        });
      } else {
        // Enable resend verification email
        this.verifyEmailAction = false;
      }
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

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public verifyEmail(data: any) {
    this.spinnerService.show();
    this.centralServerService
      .verifyEmail({ Email: data.email, VerificationToken: data.verificationToken })
      .subscribe({
        next: (response: VerifyEmailResponse) => {
          this.spinnerService.hide();
          if (response.status && response.status === RestResponse.SUCCESS) {
            if (this.resetToken) {
              // Show message
              this.messageService.showSuccessMessage(
                this.messages['verify_email_success_set_password']
              );
              // Go to reset password
              void this.router.navigate(['auth/define-password'], {
                queryParams: { hash: this.resetToken },
              });
            } else {
              if (response?.userStatus === UserStatus.INACTIVE) {
                // Show message for inactive new account by default
                this.messageService.showInfoMessage(this.messages['verify_email_success_inactive']);
              } else {
                // Show message for automatic activated account
                this.messageService.showSuccessMessage(this.messages['verify_email_success']);
              }
              // Go to login
              void this.router.navigate(['/auth/login'], {
                queryParams: { email: this.email.value },
              });
            }
            // Unexpected Error
          } else {
            // Unexpected error
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              this.messages['verify_email_error']
            );
          }
        },
        error: (error) => {
          // Hide
          this.spinnerService.hide();
          // Check status error code
          switch (error.status) {
            // Account already active
            case HTTPError.USER_ACCOUNT_ALREADY_ACTIVE_ERROR:
              // Report the error
              this.messageService.showInfoMessage(this.messages['verify_email_already_active']);
              break;
            // VerificationToken no longer valid
            case HTTPError.INVALID_TOKEN_ERROR:
              // Report the error
              this.messageService.showErrorMessage(this.messages['verify_email_token_not_valid']);
              break;
            // Email does not exist
            case StatusCodes.NOT_FOUND:
              // Report the error
              this.messageService.showErrorMessage(this.messages['verify_email_email_not_valid']);
              break;
            default:
              // Unexpected Error
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'authentication.verify_email_error'
              );
              break;
          }
          // Go to login
          void this.router.navigate(['/auth/login'], { queryParams: { email: this.email.value } });
        },
      });
  }

  public resendVerificationEmail(data: any) {
    this.reCaptchaV3Service.execute(this.siteKey, 'ActivateAccount', (token) => {
      if (token) {
        data['captcha'] = token;
      } else {
        this.messageService.showErrorMessage(this.messages['invalid_captcha_token']);
        return;
      }
      this.spinnerService.show();
      // Resend
      this.centralServerService.resendVerificationEmail(data).subscribe({
        next: (response) => {
          this.spinnerService.hide();
          if (response.status && response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage(this.messages['verify_email_resend_success']);
            // Go back to login
            void this.router.navigate(['/auth/login'], {
              queryParams: { email: this.email.value },
            });
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              this.messages['verify_email_resend_error']
            );
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          switch (error.status) {
            case HTTPError.USER_ACCOUNT_ALREADY_ACTIVE_ERROR:
              this.messageService.showInfoMessage(this.messages['verify_email_already_active']);
              void this.router.navigate(['/auth/login'], {
                queryParams: { email: this.email.value },
              });
              break;
            case StatusCodes.NOT_FOUND:
              this.messageService.showErrorMessage(this.messages['verify_email_email_not_valid']);
              break;
            default:
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'authentication.verify_email_resend_error'
              );
              break;
          }
        },
      });
    });
  }
}
