import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PaymentIntent, PaymentIntentResult, StripeElementLocale, StripeElements, StripeElementsOptions, StripePaymentElement } from '@stripe/stripe-js';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { StripeService } from '../../../services/stripe.service';
import { WindowService } from '../../../services/window.service';
import { HTTPError } from '../../../types/HTTPError';
import { TenantComponents } from '../../../types/Tenant';
import { User } from '../../../types/User';

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
  public isSendClicked = false;
  public showButton = true;
  public isTokenValid = true;
  public headerClass = 'card-header-primary';
  public title = 'settings.scan_pay.payment_intent.create_title';
  public message: string;
  // Stripe elements
  public elements: StripeElements;
  public paymentElement: StripePaymentElement;
  public paymentIntent: PaymentIntent;

  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private localeService: LocaleService,
    public translateService: TranslateService,
    public windowService: WindowService,
    public authorizationService: AuthorizationService) {
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
  }

  public ngOnInit(): void {
    this.token = this.windowService.getUrlParameterValue('VerificationToken');
    this.email = this.windowService.getUrlParameterValue('email');
    this.name = this.windowService.getUrlParameterValue('name');
    this.siteAreaID = this.windowService.getUrlParameterValue('siteAreaID');
    this.firstName = this.windowService.getUrlParameterValue('firstName');
    this.chargingStationID = this.windowService.getUrlParameterValue('chargingStationID');
    this.connectorID = +this.windowService.getUrlParameterValue('connectorID');
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
    void this.initialize();
  }

  public linkCardToAccount() {
    this.showButton = false;
    void this.doConfirmPaymentIntent();
  }

  private initialize() {
    try {
      this.spinnerService.show();
      const user = { email: this.email, password: this.token, acceptEula: true } as Partial<User>;
      // clear User and UserAuthorization
      this.authorizationService.cleanUserAndUserAuthorization();
      this.centralServerService.login(user).subscribe({
        next: async (result) => {
          this.centralServerService.loginSucceeded(result.token);
          const stripeFacade = await this.stripeService.initializeStripe();
          // Step #1 - Create A STRIPE Payment Intent to be able to initialize the payment elements
          this.paymentIntent = await this.createPaymentIntent() as PaymentIntent;
          if (!stripeFacade) {
            this.headerClass = 'card-header-danger';
            this.title = 'settings.scan_pay.billing_not_properly_set_title';
            this.message = 'settings.scan_pay.billing_not_properly_set';
          } else {
            this.initializeElements(this.paymentIntent.client_secret);
          }
        },
        error: (error) => {
          this.spinnerService.hide();
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.billing_not_properly_set_title';
          this.message = 'settings.scan_pay.billing_not_properly_set';
        }
      });
    } catch (error) {
      this.headerClass = 'card-header-danger';
      this.title = 'settings.scan_pay.unexpected_error_title';
      this.message = 'settings.scan_pay.unexpected_error_payment_intend';
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
      this.isSendClicked = true;
      // Step #2 - Confirm the STRIPE Payment Intent to carry out 3DS authentication (redirects to the bank authentication page)
      const operationResult: PaymentIntentResult = await this.getStripeFacade().confirmPayment({
        elements: this.elements,
        redirect: 'if_required'
      });
      if (operationResult?.error) {
        // 3DS authentication has been aborted or user was not able to authenticate
        this.headerClass = 'card-header-danger';
        this.title = 'settings.scan_pay.payment_intent.create_error_title';
        this.message = 'settings.scan_pay.payment_intent.create_error';
      } else {
        // Operation succeeded - try to start transaction
        const operationResultRetrieve: any = await this.retrievePaymentIntentAndStartTransaction();
        if (operationResultRetrieve) {
          this.headerClass = 'card-header-success';
          this.title = 'settings.scan_pay.payment_intent.create_success_title';
          this.message = 'settings.scan_pay.payment_intent.create_success';
        }
      }
    } catch (error) {
      this.headerClass = 'card-header-danger';
      this.title = 'settings.scan_pay.unexpected_error_title';
      this.message = 'settings.scan_pay.unexpected_error_payment_intend';
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
    } catch (error) {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.INVALID_TOKEN_ERROR:
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.verify_email_token_not_valid_title';
          this.message = 'settings.scan_pay.verify_email_token_not_valid';
          this.isTokenValid = false;
          break;
        case HTTPError.SCAN_PAY_HOLD_AMOUNT_MISSING:
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.hold_amount_not_set_title';
          this.message = 'settings.scan_pay.hold_amount_not_set';
          this.isTokenValid = false;
          this.isSendClicked = true;
          break;
        default:
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.unexpected_error_title';
          this.message = 'settings.scan_pay.unexpected_error_payment_intend';
          this.isSendClicked = true;
      }
    } finally {
      this.spinnerService.hide();
    }
  }

  private async retrievePaymentIntentAndStartTransaction() {
    try {
      this.spinnerService.show();
      const response = await this.centralServerService.scanPayHandlePaymentIntentRetrieve({
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
      return response;
    } catch (error) {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.CANNOT_REMOTE_START_CONNECTOR:
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.connector_not_available_title';
          this.message = 'settings.scan_pay.connector_not_available';
          break;
        default:
          this.headerClass = 'card-header-danger';
          this.title = 'settings.scan_pay.unexpected_error_title';
          this.message = 'settings.scan_pay.unexpected_error_payment_intend';
      }
    } finally {
      this.spinnerService.hide();
      this.isSendClicked = true;
    }
  }
}
