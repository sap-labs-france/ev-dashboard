import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentIntent, StripeElementLocale, StripeElements, StripeElementsOptions, StripeError, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentMethodDialogComponent } from 'pages/users/user/payment-methods/payment-method/payment-method.dialog.component';
import { LocaleService } from 'services/locale.service';
import { WindowService } from 'services/window.service';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { StripeService } from '../../../services/stripe.service';
import { BillingOperationResult } from '../../../types/DataResult';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-scan-pay-stripe-payment-method',
  templateUrl: 'scan-pay-stripe-payment-method.component.html',
  styleUrls: ['scan-pay-stripe-payment-method.component.scss']
})
export class ScanPayStripePaymentMethodComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PaymentMethodDialogComponent>;
  @Input() public currentUserID!: string;
  public formGroup!: UntypedFormGroup;
  public isBillingComponentActive: boolean;
  public userID: string;
  public locale: string;
  public email: string;
  public siteAreaID: string;
  public name: string;
  public firstName: string;
  public acceptConditions: AbstractControl;
  // Stripe elements
  public elements: StripeElements;
  public paymentElement: StripePaymentElement;
  public paymentIntent: PaymentIntent;
  // conditions to enable Save
  public hasAcceptedConditions: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private router: Router,
    private localeService: LocaleService,
    public translateService: TranslateService,
    public windowService: WindowService,) {
    this.isBillingComponentActive = true; // comment on gere ça ??
    this.hasAcceptedConditions = false;
  }

  public ngOnInit(): void {
    void this.initialize();
    this.userID = this.windowService.getUrlParameterValue('userID');
    this.email = this.windowService.getUrlParameterValue('email');
    this.siteAreaID = this.windowService.getUrlParameterValue('siteAreaID');
    this.name = this.windowService.getUrlParameterValue('name');
    this.firstName = this.windowService.getUrlParameterValue('firstName');
    this.formGroup = new UntypedFormGroup({
      acceptConditions: new UntypedFormControl()
    });
    this.acceptConditions = this.formGroup.controls['acceptConditions'];
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
  }

  public handleAcceptConditions() {
    this.hasAcceptedConditions = !this.hasAcceptedConditions;
  }

  public linkCardToAccount() {
    // this.isSaveClicked = true;
    void this.doCreatePaymentMethod();
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      // const stripeFacade = await this.stripeService.initializeStripe();
      const stripeFacade = await this.stripeService.initializeStripeForScanAndPay();
      // Step #1 - Create A STRIPE Setup Intent
      this.paymentIntent = await this.createPaymentIntent() as PaymentIntent;
      if (!stripeFacade) {
        this.messageService.showErrorMessage('settings.billing.not_properly_set');
      } else {
        this.initializeElements(this.paymentIntent.client_secret);
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
  }

  private getStripeFacade() {
    return this.stripeService.getStripeFacade();
  }

  private initializeElements(clientSecret: string) {
    // const language = this.localeService.getLocaleInformation()?.language;
    const options: StripeElementsOptions = {
      locale: this.locale as StripeElementLocale,
      clientSecret
    };
    this.elements = this.getStripeFacade().elements(options);
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  private async doCreatePaymentMethod() {
    const operationResult: any = await this.createPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      this.messageService.showErrorMessage(operationResult.error.message);
      // this.isSavåeClicked = false;
    } else {
      // Operation succeeded
      this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', { last4: operationResult.internalData.card.last4 });
      // this.close(true);
    }
  }

  private async createPaymentMethod(): Promise<any> {
    try {
      // Step #2 - Now attach the payment method to the user
      return this.attachPaymentMethod(this.paymentIntent);
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    }
  }

  private async createPaymentIntent() {
    try {
      this.spinnerService.show();
      const response  = await this.centralServerService.setupPaymentMethodScanAndPay({
        email: this.email,
        firstName: this.firstName,
        name: this.name,
        siteAreaID: this.siteAreaID,
        locale: this.locale,
      }).toPromise();
      return response?.internalData;
      // return response;
    } finally {
      this.spinnerService.hide();
    }
  }

  private async confirmPaymentIntent(): Promise<{ paymentIntent?: PaymentIntent; error?: StripeError }> {
    const result = await this.getStripeFacade().confirmSetup({
      elements : this.elements,
      redirect: 'if_required'
    });
    return result;
  }

  private async attachPaymentMethod(paymentIntent: PaymentIntent) {
    try {
      this.spinnerService.show();
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethodScanAndPay({
        paymentIntentID: paymentIntent.id,
        // paymentMethodID: paymentIntent.payment_method, plus besoin ??
      }).toPromise();
      return response;
    } finally {
      this.spinnerService.hide();
    }
  }
}
