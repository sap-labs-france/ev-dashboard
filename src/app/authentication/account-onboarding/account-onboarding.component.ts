import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingAccount } from 'types/Billing';

import { CentralServerService } from '../../services/central-server.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { WindowService } from '../../services/window.service';
import { Utils } from '../../utils/Utils';

@Component({
  selector: 'app-account-onboarding',
  templateUrl: 'account-onboarding.component.html',
})
export class AccountOnboardingComponent implements OnInit, OnDestroy {
  public formGroup: UntypedFormGroup;
  public onboardingHasBeenDone = false;
  public accountActivationFailed = false;
  private tenantID: string;
  private accountID: string;
  private operationResult: string;

  public constructor(
    private centralServerService: CentralServerService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private windowService: WindowService
  ) {
    // Init Form
    this.formGroup = new UntypedFormGroup({
      email: new UntypedFormControl('', Validators.compose([Validators.required])),
    });
    // Get data from URL parameters
    // e.g.:
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1&OperationResult=Success
    // - http://utbillingplatform.localhost:45000/auth/account-onboarding?TenantID=aaaaaaaaaaaaaaaaaaaaaab4&AccountID=62c7e3c6659750bbebf591c1&OperationResult=Refresh
    this.tenantID = this.route.snapshot.queryParamMap.get('TenantID');
    this.accountID = this.route.snapshot.queryParamMap.get('AccountID');
    this.operationResult = this.route.snapshot.queryParamMap.get('OperationResult');
    if (this.operationResult === 'Success') {
      this.onboardingHasBeenDone = true;
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
    if (this.onboardingHasBeenDone) {
      this.triggerAccountActivation();
    }
  }

  public ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('lock-page');
    body.classList.remove('off-canvas-sidebar');
  }

  public navigate() {
    if (this.onboardingHasBeenDone) {
      // Go to login
      void this.router.navigate(['/auth/login']);
    } else {
      // Attempt to redirect vers the STRIPE onboarding page
      this.navigateToOnboardingPage();
    }
  }

  private navigateToOnboardingPage() {
    this.centralServerService.refreshBillingAccount(this.tenantID, this.accountID).subscribe({
      next: (billingAccount: BillingAccount) => {
        this.spinnerService.hide();
        if (billingAccount.activationLink) {
          // Redirect to the account onboarding wizard
          window.location.href = billingAccount.activationLink;
        } else {
          this.accountActivationFailed = true;
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        this.accountActivationFailed = true;
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'accounts.onboarding.onboarding_process_failed'
        );
      },
    });
  }

  private triggerAccountActivation() {
    this.centralServerService.activateBillingAccount(this.tenantID, this.accountID).subscribe({
      next: (billingAccount: BillingAccount) => {
        this.spinnerService.hide();
        if (!billingAccount.id) {
          this.accountActivationFailed = true;
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        this.accountActivationFailed = true;
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'accounts.onboarding.onboarding_process_failed'
        );
      },
    });
  }
}
