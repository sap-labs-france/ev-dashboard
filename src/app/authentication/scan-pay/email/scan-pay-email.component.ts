import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusCodes } from 'http-status-codes';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../services/central-server.service';
import { ConfigService } from '../../../services/config.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { Constants } from '../../../utils/Constants';

@Component({
  selector: 'app-scan-pay-email',
  templateUrl: 'scan-pay-email.component.html',
})

export class ScanPayEmailComponent implements OnInit, OnDestroy {
  public email: AbstractControl;
  public name: AbstractControl;
  public firstName: AbstractControl;
  public formGroup: UntypedFormGroup;
  public isSendClicked: boolean;
  public tenantLogo = Constants.NO_IMAGE;
  public acceptEula: AbstractControl;

  private siteKey: string;
  private subDomain: string;
  private currentSiteAreaID: string;
  private chargingStationID: string;
  private connectorID: string;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    private windowService: WindowService,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute) {
    // Get the Site Key
    this.siteKey = this.configService.getUser().captchaSiteKey;
    this.currentSiteAreaID = this.activatedRoute?.snapshot?.params['siteAreaID'];
    this.chargingStationID = this.activatedRoute?.snapshot?.params['chargingStationID'];
    this.connectorID = this.activatedRoute?.snapshot?.params['connectorID'];
    // Init Form
    this.formGroup = new UntypedFormGroup({
      email: new FormControl(null,
        Validators.compose([
          Validators.required,
          Validators.email,
        ])),
      name: new FormControl(null,
        Validators.compose([
          Validators.required
        ])),
      firstName: new FormControl(null,
        Validators.compose([
          Validators.required
        ])),
      acceptEula: new FormControl(null,
        Validators.compose([
          Validators.required,
        ])),
    });
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Form
    this.email = this.formGroup.controls['email'];
    this.name = this.formGroup.controls['name'];
    this.firstName = this.formGroup.controls['firstName'];
    this.acceptEula = this.formGroup.controls['acceptEula'];
    setTimeout(() => {
      const card = document.getElementsByClassName('card')[0];
      // After 700 ms we add the class animated to the login/register card
      card.classList.remove('card-hidden');
    }, 700);
    this.isSendClicked = false;
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
              Utils.handleHttpError(error, this.router, this.messageService,
                this.centralServerService, 'general.unexpected_error_backend');
          }
        }
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
    if (control.value) {
      control.setValue(Utils.firstLetterInUpperCase(control.value));
    }
  }

  public sendEmailVerificationScanAndPay(data: any) {
    // Show
    this.spinnerService.show();
    this.reCaptchaV3Service.execute(this.siteKey, 'VerifScanPay', (token) => {
      if (token) {
        data['captcha'] = token;
        data['siteAreaID'] = this.currentSiteAreaID;
        data['chargingStationID'] = this.chargingStationID;
        data['connectorID'] = this.connectorID;
      } else {
        this.messageService.showErrorMessage('authentication.invalid_captcha_token');
        return;
      }
      // launch email verif
      this.centralServerService.scanPayVerifyEmail(data).subscribe({
        next: (response) => {
          this.isSendClicked = true;
          this.spinnerService.hide();
          this.messageService.showSuccessMessage('settings.billing.payment_intent_create_account_success');
          // void this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          this.spinnerService.hide();
          this.messageService.showErrorMessage('settings.billing.payment_intent_create_account_error', { error: error.message });
          // void this.router.navigate(['/auth/login']);
        }
      });
    });
  }
}
