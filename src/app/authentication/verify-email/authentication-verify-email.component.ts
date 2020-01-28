import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'app/services/window.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-verify-email',
  templateUrl: './authentication-verify-email.component.html',
})
export class AuthenticationVerifyEmailComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public formGroup: FormGroup;
  public verifyEmailAction!: boolean;
  public verificationToken: string|null;
  public resetToken: string|null;
  public verificationEmail: string|null;
  private messages!: object;

  private siteKey: string;

  constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private windowService: WindowService,
    private translateService: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private configService: ConfigService) {
    // Load the tranlated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    // Init Form
    this.formGroup = new FormGroup({
      email: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email,
        ])),
    });
    // Form
    this.email = this.formGroup.controls['email'];
    // Get verificationToken & email
    this.verificationToken = this.route.snapshot.queryParamMap.get('VerificationToken');
    this.resetToken = this.route.snapshot.queryParamMap.get('ResetToken');
    this.verificationEmail = this.route.snapshot.queryParamMap.get('Email');
    // Handle Deep Linking
    if (Utils.isInMobileApp()) {
      // Forward to Mobile App
      const mobileAppURL: string = Utils.buildMobileAppDeepLink(
        `verifyAccount/${this.windowService.getSubdomain()}/${this.email}/${this.verificationToken}/${this.resetToken}`);
      window.location.href = mobileAppURL;
    }
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(() => {
      // after 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
    // Check email
    if (this.verificationEmail && !Utils.isInMobileApp()) {
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
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  verifyEmail(data: any) {
    // Show
    this.spinnerService.show();
    // Verify Email
    this.centralServerService.verifyEmail({Email: data.email, VerificationToken: data.verificationToken}).subscribe((response) => {
      // Hide
      this.spinnerService.hide();
      // Success
      if (response.status && response.status === Constants.REST_RESPONSE_SUCCESS) {
        if (this.resetToken) {
          // Show message
          // @ts-ignore
          this.messageService.showSuccessMessage(this.messages['verify_email_success_set_password']);
          // Go to reset password
          this.router.navigate(['auth/define-password'], {queryParams: {hash: this.resetToken}});
        } else {
          // Show message
          // @ts-ignore
          this.messageService.showSuccessMessage(this.messages['verify_email_success']);
          // Go to login
          this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
        }
        // Unexpected Error
      } else {
        // Unexpected error
        Utils.handleError(JSON.stringify(response),
          // @ts-ignore
          this.messageService, this.messages['verify_email_error']);
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status error code
      switch (error.status) {
        // Account already active
        case 530:
          // Report the error
          // @ts-ignore
          this.messageService.showInfoMessage(this.messages['verify_email_already_active']);
          break;
        // VerificationToken no longer valid
        case 540:
          // Report the error
          // @ts-ignore
          this.messageService.showErrorMessage(this.messages['verify_email_token_not_valid']);
          break;
        // Email does not exist
        case 550:
          // Report the error
          // @ts-ignore
          this.messageService.showErrorMessage(this.messages['verify_email_email_not_valid']);
          break;
        default:
          // Unexpected Error
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'authentication.verify_email_error');
          break;
      }
      // Go to login
      this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
    });
  }

  resendVerificationEmail(data: any) {
    this.reCaptchaV3Service.execute(this.siteKey, 'ActivateAccount', (token) => {
      if (token) {
        data['captcha'] = token;
      } else {
          // @ts-ignore
        this.messageService.showErrorMessage(this.messages['invalid_captcha_token']);
        return;
      }
      this.spinnerService.show();
      // Resend
      this.centralServerService.resendVerificationEmail(data).subscribe((response) => {
        this.spinnerService.hide();
        // Success
        if (response.status && response.status === Constants.REST_RESPONSE_SUCCESS) {
          // @ts-ignore
          this.messageService.showSuccessMessage(this.messages['verify_email_resend_success']);
          // Go back to login
          this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
          // Unexpected Error
        } else {
          Utils.handleError(JSON.stringify(response),
            // @ts-ignore
            this.messageService, this.messages['verify_email_resend_error']);
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Check status error code
        switch (error.status) {
          // Account already active
          case 530:
            // @ts-ignore
            this.messageService.showInfoMessage(this.messages['verify_email_already_active']);
            this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
            break;
          // Email does not exist
          case 550:
            // @ts-ignore
            this.messageService.showErrorMessage(this.messages['verify_email_email_not_valid']);
            break;
          // Unexpected Error
          default:
            Utils.handleHttpError(error, this.router,
              this.messageService, this.centralServerService, 'authentication.verify_email_resend_error');
            break;
        }
      });
    });
  }
}
