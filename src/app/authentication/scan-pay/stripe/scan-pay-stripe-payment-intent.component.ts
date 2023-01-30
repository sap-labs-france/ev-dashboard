import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentIntent, PaymentIntentResult, StripeElementLocale, StripeElements, StripeElementsOptions, StripePaymentElement } from '@stripe/stripe-js';

import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { StripeService } from '../../../services/stripe.service';
import { WindowService } from '../../../services/window.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-scan-pay-stripe-payment-intent',
  templateUrl: 'scan-pay-stripe-payment-intent.component.html',
  styleUrls: ['scan-pay-stripe-payment-intent.component.scss']
})
export class ScanPayStripePaymentIntentComponent implements OnInit {
  public formGroup!: UntypedFormGroup;
  public isBillingComponentActive: boolean;
  public locale: string;
  public email: string;
  public siteAreaID: string;
  public name: string;
  public firstName: string;
  public chargingStationID: string;
  public connectorID: number;
  public token: string;
  // Stripe elements
  public elements: StripeElements;
  public paymentElement: StripePaymentElement;
  public paymentIntent: PaymentIntent;

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
  }

  public ngOnInit(): void {
    void this.initialize();
    this.email = this.windowService.getUrlParameterValue('email');
    this.siteAreaID = this.windowService.getUrlParameterValue('siteAreaID');
    this.name = this.windowService.getUrlParameterValue('name');
    this.firstName = this.windowService.getUrlParameterValue('firstName');
    this.chargingStationID = this.windowService.getUrlParameterValue('chargingStationID');
    this.connectorID = +this.windowService.getUrlParameterValue('connectorID');
    this.token = this.windowService.getUrlParameterValue('VerificationToken');
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
  }

  public linkCardToAccount() {
    void this.doConfirmPaymentIntent();
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      const stripeFacade = await this.stripeService.initializeStripeForScanAndPay();
      // Step #1 - Create A STRIPE Payment Intent to be able to initialize the payment elements
      this.paymentIntent = await this.createPaymentIntent() as PaymentIntent;
      if (!stripeFacade) {
        this.messageService.showErrorMessage('settings.billing.not_properly_set');
      } else {
        this.initializeElements(this.paymentIntent.client_secret);
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_payment_intend');
    } finally {
      this.spinnerService.hide();
    }
  }

  private getStripeFacade() {
    return this.stripeService.getStripeFacade();
  }

  private initializeElements(clientSecret: string) {
    const options: StripeElementsOptions = {
      locale: this.locale as StripeElementLocale,
      clientSecret
    };
    this.elements = this.getStripeFacade().elements(options);
    this.paymentElement = this.elements.create('payment');
    this.paymentElement.mount('#payment-element');
  }

  private async doConfirmPaymentIntent(): Promise<void> {
    try {
      // Step #2 - Confirm the STRIPE Payment Intent to carry out 3DS authentication (redirects to the bank authentication page)
      const operationResult: PaymentIntentResult = await this.getStripeFacade().confirmPayment({
        elements : this.elements,
        redirect: 'if_required'
      });
      if (operationResult.error) {
        // 3DS authentication has been aborted or user was not able to authenticate
        this.messageService.showErrorMessage('settings.billing.payment_intent_create_error', { stripeError: operationResult.error.message });
      } else {
        // Operation succeeded
        const toto = await this.retrievePaymentIntentAndStartTransaction();
        this.messageService.showSuccessMessage('settings.billing.payment_intent_create_success');
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_payment_intend');
    }
  }

  private async createPaymentIntent() {
    try {
      this.spinnerService.show();
      const response = await this.centralServerService.scanPayHandlePaymentIntent({
        email: this.email,
        firstName: this.firstName,
        name: this.name,
        siteAreaID: this.siteAreaID,
        locale: this.locale,
        chargingStationID: this.chargingStationID,
        connectorID: this.connectorID,
        verificationToken: this.token,
      }).toPromise();
      return response?.internalData;
    } finally {
      this.spinnerService.hide();
    }
  }

  private async retrievePaymentIntentAndStartTransaction() {
    try {
      this.spinnerService.show();
      const response = await this.centralServerService.scanPayHandlePaymentIntent({
        email: this.email,
        firstName: this.firstName,
        name: this.name,
        siteAreaID: this.siteAreaID,
        locale: this.locale,
        paymentIntentID: this.paymentIntent?.id,
        chargingStationID: this.chargingStationID,
        connectorID: this.connectorID,
        verificationToken: this.token,
      }).toPromise();
      return response?.internalData;
    } finally {
      this.spinnerService.hide();
      //TODO: open same tab the /stop avec l'ID de la transaction current
      // window.open('http://slf.localhost:45000/scan-pay/stop/123');
    }
  }
}
