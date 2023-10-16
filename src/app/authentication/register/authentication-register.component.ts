import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ReCaptchaV3Service } from 'ngx-captcha';

import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { RestResponse } from '../../types/GlobalType';
import { HTTPError } from '../../types/HTTPError';
import { User } from '../../types/User';
import { Constants } from '../../utils/Constants';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-register',
  templateUrl: 'authentication-register.component.html',
})
export class AuthenticationRegisterComponent implements OnInit, OnDestroy {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public formGroup: UntypedFormGroup;
  public name: AbstractControl;
  public firstName: AbstractControl;
  public email: AbstractControl;
  public mobile!: AbstractControl;
  public passwords: UntypedFormGroup;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public acceptEula: AbstractControl;
  public hidePassword = true;
  public hideRepeatPassword = true;

  public tenantLogo = Constants.NO_IMAGE;

  private messages: Record<string, string>;
  private subDomain: string;

  private siteKey: string;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private windowService: WindowService,
    private configService: ConfigService
  ) {
    // Load the translated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Init Form
    this.formGroup = new UntypedFormGroup({
      name: new UntypedFormControl('', Validators.compose([Validators.required])),
      firstName: new UntypedFormControl('', Validators.compose([Validators.required])),
      email: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Validators.email])
      ),
      mobile: new UntypedFormControl(
        '',
        Validators.compose([Validators.required, Users.validatePhone])
      ),
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
      acceptEula: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    // Form
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.mobile = this.formGroup.controls['mobile'];
    this.passwords = this.formGroup.controls['passwords'] as UntypedFormGroup;
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.firstName = this.formGroup.controls['firstName'];
    this.acceptEula = this.formGroup.controls['acceptEula'];
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

  public toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  public firstLetterToUpperCase(control: AbstractControl) {
    control.setValue(Utils.firstLetterInUpperCase(control.value));
  }

  public register(user: User) {
    this.reCaptchaV3Service.execute(this.siteKey, 'RegisterUser', (token) => {
      if (token) {
        user['captcha'] = token;
      } else {
        this.messageService.showErrorMessage(this.messages['invalid_captcha_token']);
        return;
      }
      if (this.formGroup.valid) {
        this.updateUserPassword(user);
        this.spinnerService.show();
        this.centralServerService.registerUser(user).subscribe({
          next: (response) => {
            // Hide
            this.spinnerService.hide();
            // Ok?
            if (response.status && response.status === RestResponse.SUCCESS) {
              // Show success
              if (Utils.isEmptyString(this.subDomain)) {
                // Super User in Master Tenant
                this.messageService.showSuccessMessage(
                  this.messages['register_super_user_success']
                );
              } else {
                // User in Tenant
                this.messageService.showSuccessMessage(this.messages['register_user_success']);
              }
              // Login successful so redirect to return url
              void this.router.navigate(['/auth/login'], {
                queryParams: { email: this.email.value },
              });
            } else {
              // Unexpected Error
              Utils.handleError(
                JSON.stringify(response),
                this.messageService,
                this.messages['register_user_error']
              );
            }
          },
          error: (error) => {
            // Hide
            this.spinnerService.hide();
            // Check status
            switch (error.status) {
              // Email already exists
              case HTTPError.USER_EMAIL_ALREADY_EXIST_ERROR:
                this.messageService.showErrorMessage(this.messages['email_already_exists']);
                break;
              // User Agreement not checked
              case HTTPError.USER_EULA_ERROR:
                this.messageService.showErrorMessage(this.messages['must_accept_eula']);
                break;
              // Unexpected error
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
    });
  }

  private updateUserPassword(user: User) {
    if (user['passwords'] && user['passwords']['password']) {
      user['password'] = user['passwords']['password'];
      delete user['passwords'];
    }
  }
}
