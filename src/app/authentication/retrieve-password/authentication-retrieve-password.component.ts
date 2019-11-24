import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from 'app/services/config.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CentralServerService } from '../../services/central-server.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-retrieve-password',
  templateUrl: './authentication-retrieve-password.component.html',
})

export class AuthenticationRetrievePasswordComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public formGroup: FormGroup;

  private siteKey: string;

  constructor(
      private centralServerService: CentralServerService,
      private router: Router,
      private route: ActivatedRoute,
      private spinnerService: SpinnerService,
      private messageService: MessageService,
      private reCaptchaV3Service: ReCaptchaV3Service,
      private configService: ConfigService,
      private translateService: TranslateService) {
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
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(() => {
      // After 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  resetPassword(data) {
    this.reCaptchaV3Service.execute(this.siteKey, 'ResetPassword', (token) => {
      if (token) {
        data['captcha'] = token;
      } else {
        this.messageService.showErrorMessage('general.invalid_captcha_token');
        return;
      }
      // Show
      this.spinnerService.show();
      // Yes: Update
      this.centralServerService.resetUserPassword(data).subscribe((response) => {
        // Hide
        this.spinnerService.hide();
        // Success
        if (response.status && response.status === Constants.REST_RESPONSE_SUCCESS) {
          // Show message`
          this.messageService.showSuccessMessage('authentication.reset_password_success');
          // Go back to login
          this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
          // Unexpected Error
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, 'authentication.reset_password_error');
        }
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Check status error code
        switch (error.status) {
          // Email does not exist
          case 550:
            this.messageService.showErrorMessage('authentication.reset_password_email_not_valid');
            break;
          // Unexpected error`
          default:
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
        }
      });
    });
  }
}
