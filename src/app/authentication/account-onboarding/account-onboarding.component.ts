import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { BillingAccount } from 'types/Billing';
import { UserStatus } from 'types/User';

import { CentralServerService } from '../../services/central-server.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { BillingAccountDataResult, VerifyEmailResponse } from '../../types/DataResult';
import { RestResponse } from '../../types/GlobalType';
import { HTTPError } from '../../types/HTTPError';
import { Constants } from '../../utils/Constants';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-account-onboarding',
  templateUrl: 'account-onboarding.component.html',
})
export class AccountOnboardingComponent implements OnInit, OnDestroy {
  public formGroup: FormGroup;
  public onboardingHasBeenDone = false;
  private tenantID: string | null;
  private accountID: string | null;
  private operationResult: string | null;
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
    private configService: ConfigService) {
    // Init Form
    this.formGroup = new FormGroup({
      email: new FormControl('',
        Validators.compose([
          Validators.required
        ])),
    });
    // Keep the sub-domain
    this.subDomain = this.windowService.getSubdomain();
    // Get data from URL parameters
    // e.g.:
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1&OperationResult=Success
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1&OperationResult=Refresh
    this.accountID = this.route.snapshot.queryParamMap.get('AccountID');
    this.accountID = this.route.snapshot.queryParamMap.get('AccountID');
    this.operationResult = this.route.snapshot.queryParamMap.get('OperationResult');
    if ( this.operationResult === 'Success' ) {
      this.onboardingHasBeenDone = true ;
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

    if ( this.onboardingHasBeenDone ) {
      this.triggerAccountActivation();
    }
  }

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public navigate() {
    if ( this.onboardingHasBeenDone ) {
      // Go to login
      void this.router.navigate(['/auth/login']);
    } else {
      // Attempt to redirect vers the STRIPE onboarding page
      this.navigateToOnboardingPage();
    }
  }

  private navigateToOnboardingPage() {
    this.centralServerService.refreshBillingAccount(this.accountID).subscribe((billingAccount: BillingAccount) => {
      this.spinnerService.hide();
      if (billingAccount.activationLink) {
        // Redirect to the account onboarding wizard
        window.location.href = billingAccount.activationLink;
      } else {
        // Unexpected error
        // TODO - translate
        Utils.handleHttpError(billingAccount, this.router, this.messageService, this.centralServerService, 'Operation failed - The link to the onboarding page could not be retrieved');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status error code
      // TODO - translate
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'Operation failed - The link to the onboarding page could not be retrieved');
    });
  }

  private triggerAccountActivation() {
    this.centralServerService.activateBillingAccount(this.accountID).subscribe((billingAccount: BillingAccount) => {
      this.spinnerService.hide();
      if (billingAccount.id) {
        // Nothing to do - just show the CONGRATULATION message
      } else {
        // Unexpected error
        // TODO - translate
        Utils.handleHttpError(billingAccount, this.router, this.messageService, this.centralServerService, 'Operation failed - The onboarding of the account has been aborted');
      }
    }, (error) => {
      // Hide
      this.spinnerService.hide();
      // Check status error code
      // TODO - translate
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'Operation failed - The onboarding of the account has been aborted');
    });
  }

}
