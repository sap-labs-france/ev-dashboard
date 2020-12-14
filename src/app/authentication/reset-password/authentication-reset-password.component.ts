import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReCaptchaV3Service } from 'ngx-captcha';

import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { Constants } from '../../utils/Constants';

@Component({
  selector: 'app-authentication-reset-password',
  templateUrl: './authentication-reset-password.component.html',
})

export class AuthenticationResetPasswordComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public formGroup: FormGroup;

  private siteKey: string;
  private subDomain: string;
  public tenantLogo = Constants.TENANT_DEFAULT_LOGO;

  constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private windowService: WindowService,
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
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Form
    this.email = this.formGroup.controls['email'];
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
    // Retrieve tenant's logo
    this.centralServerService.getTenantLogoBySubdomain(this.subDomain).subscribe((tenantLogo: string) => {
      if (tenantLogo) {
        this.tenantLogo = tenantLogo;
      }
    });
  }

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public resetPassword(data: any) {
    this.reCaptchaV3Service.execute(this.siteKey, 'ResetPassword', (token) => {
      if (token) {
        data['captcha'] = token;
      } else {
        this.messageService.showErrorMessage('authentication.invalid_captcha_token');
        return;
      }
      // Show
      this.spinnerService.show();
      // Yes: Update
      this.centralServerService.resetUserPassword(data).subscribe((response) => {
        // Hide
        this.spinnerService.hide();
        this.messageService.showSuccessMessage('authentication.reset_password_success');
        this.router.navigate(['/auth/login']);
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        this.messageService.showSuccessMessage('authentication.reset_password_success');
        this.router.navigate(['/auth/login']);
      });
    });
  }
}
