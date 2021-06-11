/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SetupIntent, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements, StripeError } from '@stripe/stripe-js';
import { ComponentService } from 'services/component.service';
import { StripeService } from 'services/stripe.service';
import { BillingOperationResult } from 'types/DataResult';
import TenantComponents from 'types/TenantComponents';

import { CentralServerService } from '../../../../../../services/central-server.service';
import { MessageService } from '../../../../../../services/message.service';
import { SpinnerService } from '../../../../../../services/spinner.service';
import { Utils } from '../../../../../../utils/Utils';
import { PaymentMethodDialogComponent } from '../payment-method.dialog.component';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
})

export class PaymentMethodComponent implements OnInit {

  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PaymentMethodDialogComponent>;
  @Input() public currentUserID!: string;
  @ViewChild('cardInfo', { static: true }) public cardInfo: ElementRef;
  public formGroup!: FormGroup;
  public isBillingComponentActive: boolean;
  public userID: string;
  public acceptConditions: AbstractControl;
  // Stripe elements
  public elements: StripeElements;
  public cardNumber: StripeCardNumberElement;
  public expirationDate: StripeCardExpiryElement;
  public cvc: StripeCardCvcElement;
  // Errors
  public cardNumberError: string;
  public expirationDateError: string;
  public cvcError: string;
  // conditions to enable Save
  public hasAcceptedConditions: boolean;
  public isCardNumberValid: boolean;
  public isExpirationDateValid: boolean;
  public isCvcValid: boolean;
  public isSaveClicked: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private router: Router,
    private componentService: ComponentService,
    public translateService: TranslateService) {
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.hasAcceptedConditions = false;
    this.isCardNumberValid = false;
    this.isExpirationDateValid = false;
    this.isCvcValid = false;
    this.isSaveClicked = false;
  }

  public ngOnInit(): void {
    // TODO: make sure to wait for stripe to be initialized - spinner show
    this.initialize();
    this.userID = this.dialogRef.componentInstance.userID;
    this.formGroup = new FormGroup({
      acceptConditions: new FormControl()
    });
    this.acceptConditions = this.formGroup.controls['acceptConditions'];
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      const stripeFacade = await this.stripeService.initializeStripe();
      if ( !stripeFacade ) {
        this.messageService.showErrorMessage('settings.billing.not_properly_set');
      } else {
        this.initializeCardElements();
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
  }

  public handleAcceptConditions() {
    this.hasAcceptedConditions = !this.hasAcceptedConditions;
  }

  private getStripeFacade() {
    return this.stripeService.getStripeFacade();
  }

  private initializeCardElements() {
    this.elements = this.getStripeFacade().elements();
    // Card number element
    this.cardNumber = this.elements.create('cardNumber');
    this.cardNumber.mount('#cardNumber');
    this.cardNumber.on('change', event => {
      // this.cardNumberError = event.error?.message || '';
      this.cardNumberError = event.error ? this.translateService.instant('settings.billing.payment_methods_card_number_error') : '';
      this.isCardNumberValid = !event.error && event.complete;
    });
    // Card expiry element
    this.expirationDate = this.elements.create('cardExpiry');
    this.expirationDate.mount('#cardExp');
    this.expirationDate.on('change', event => {
      this.expirationDateError = event.error ? this.translateService.instant('settings.billing.payment_methods_expiration_date_error') : '';
      this.isExpirationDateValid = !event.error && event.complete;
    });
    // Card CVC element
    this.cvc = this.elements.create('cardCvc');
    this.cvc.mount('#cardCvc');
    this.cvc.on('change', event => {
      this.cvcError = event.error ? this.translateService.instant('settings.billing.payment_methods_cvc_error') : '';
      this.isCvcValid = !event.error && event.complete;
    });
  }

  public linkCardToAccount() {
    this.isSaveClicked = true;
    void this.doCreatePaymentMethod();
  }

  private async doCreatePaymentMethod() {
    const operationResult: any = await this.createPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      if (operationResult.error.code === 'card_declined') {
        this.isCardNumberValid = false;
        this.messageService.showErrorMessage('settings.billing.payment_methods_create_error_card_declined');
        this.cardNumberError = this.translateService.instant('settings.billing.payment_methods_card_declined');
        this.cardNumber.focus();
      } else {
        this.messageService.showErrorMessage('settings.billing.payment_methods_create_error');
      }
      this.isSaveClicked = false;
    } else {
      this.spinnerService.hide();
      // Operation succeeded
      this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', { last4: operationResult.internalData.card.last4 });
      this.close(true);
    }
  }

  private async createPaymentMethod(): Promise<any> {
    // c.f. STRIPE SAMPLE at: https://stripe.com/docs/billing/subscriptions/fixed-price#collect-payment
    let operationResult = null;
    try {
      this.spinnerService.show();
      // -----------------------------------------------------------------------------------------------
      // Step #0 - Create Setup Intent
      // -----------------------------------------------------------------------------------------------
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
        userID: this.userID
      }).toPromise();
      // -----------------------------------------------------------------------------------------------
      // Step #1 - Confirm the SetupIntent with data provided and carry out 3DS
      // c.f. https://stripe.com/docs/js/setup_intents/confirm_card_setup
      // -----------------------------------------------------------------------------------------------
      const setupIntent: any = response?.internalData;
      // TODO: handle spinner .hide / .show in a better way ? to be tested in prod // we cannot anymore reclick save button twice
      // setTimeout doesn't work as expected - it never hides...
      // setTimeout(function() {
      this.spinnerService.hide();
      // }, 4000);
      // eslint-disable-next-line max-len
      const result: { setupIntent?: SetupIntent; error?: StripeError } = await this.getStripeFacade().confirmCardSetup( setupIntent.client_secret, {
        payment_method: {
          card: this.cardNumber
          // TODO: put email and address
          // billing_details: {
          //   name: this.centralServerService.getCurrentUserSubject().value.email + new Date(),
          // },
        },
      });
      this.spinnerService.show();
      if (result.error) {
        operationResult = result;
      } else {
        operationResult = this.attachPaymentMethod(result);
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
    return operationResult;
  }
  // -----------------------------------------------------------------------------------------------
  // Step #2 - Really attach the payment method / not called when 3DS failed
  // -----------------------------------------------------------------------------------------------
  private async attachPaymentMethod(operationResult: {setupIntent?: SetupIntent; error?: StripeError}) {
    const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
      setupIntentId: operationResult.setupIntent?.id,
      paymentMethodId: operationResult.setupIntent?.payment_method,
      userID: this.userID
    }).toPromise();
    return response;
  }

  public close(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }
}
