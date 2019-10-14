import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WindowService } from 'app/services/window.service';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Constants } from '../../utils/Constants';
import { ParentErrorStateMatcher } from '../../utils/ParentStateMatcher';
import { Users } from '../../utils/Users';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-authentication-register',
  templateUrl: './authentication-register.component.html',
})

export class AuthenticationRegisterComponent implements OnInit, OnDestroy {
  public parentErrorStateMatcher = new ParentErrorStateMatcher();
  public formGroup: FormGroup;
  public name: AbstractControl;
  public firstName: AbstractControl;
  public email: AbstractControl;
  public passwords: FormGroup;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public acceptEula: AbstractControl;
  public hidePassword = true;
  public hideRepeatPassword = true;
  private messages: object;
  private subDomain: string;

  private siteKey: string;

  constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private translateService: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private windowService: WindowService,
    private configService: ConfigService) {
    // Load the tranlated messages
    this.translateService.get('authentication', {}).subscribe((messages) => {
      this.messages = messages;
    });
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Init Form
    this.formGroup = new FormGroup({
      name: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      firstName: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      email: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.email,
        ])),
      passwords: new FormGroup({
        password: new FormControl('',
          Validators.compose([
            Validators.required,
            Users.passwordWithNoSpace,
            Users.validatePassword,
          ])),
        repeatPassword: new FormControl('',
          Validators.compose([
            Validators.required,
          ])),
      }, (passwordFormGroup: FormGroup) => {
        return Utils.validateEqual(passwordFormGroup, 'password', 'repeatPassword');
      }),
      acceptEula: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.name = this.formGroup.controls['name'];
    this.email = this.formGroup.controls['email'];
    this.passwords = (this.formGroup.controls['passwords'] as FormGroup);
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
    this.firstName = this.formGroup.controls['firstName'];
    this.acceptEula = this.formGroup.controls['acceptEula'];
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('lock-page');
    body.classList.add('off-canvas-sidebar');
    const card = document.getElementsByClassName('card')[0];
    setTimeout(function() {
      // After 1000 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  toUpperCase(control: AbstractControl) {
    control.setValue(control.value.toUpperCase());
  }

  register(user) {
    this.reCaptchaV3Service.execute(this.siteKey, 'RegisterUser', (token) => {
      if (token) {
        user['captcha'] = token;
      } else {
        this.messageService.showErrorMessage(this.messages['invalid_captcha_token']);
        return;
      }
      if (this.formGroup.valid) {
        // Show
        this.spinnerService.show();
        // Create
        this.centralServerService.registerUser(user).subscribe((response) => {
          // Hide
          this.spinnerService.hide();
          // Ok?
          if (response.status && response.status === Constants.REST_RESPONSE_SUCCESS) {
            // Show success
            if (this.subDomain === '') {
              // Super User in Master Tenant
              this.messageService.showSuccessMessage(this.messages['register_super_user_success']);
            } else {
              // User in Tenant
              this.messageService.showSuccessMessage(this.messages['register_user_success']);
            }
            // Login successful so redirect to return url
            this.router.navigate(['/auth/login'], {queryParams: {email: this.email.value}});
          } else {
            // Unexpected Error
            Utils.handleError(JSON.stringify(response),
              this.messageService, this.messages['register_user_error']);
          }
        }, (error) => {
          // Hide
          this.spinnerService.hide();
          // Check status
          switch (error.status) {
            // Email already exists
            case 510:
              this.messageService.showErrorMessage(this.messages['email_already_exists']);
              break;
            // User Agreement not checked
            case 520:
              this.messageService.showErrorMessage(this.messages['must_accept_eula']);
              break;
            // Unexpected error`
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
          }
        });
      }
    });
  }
}
