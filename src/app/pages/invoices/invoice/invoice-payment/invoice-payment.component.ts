import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SetupIntent, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements, StripeError } from '@stripe/stripe-js';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { StripeService } from 'services/stripe.service';
import { BillingInvoiceStatus } from 'types/Billing';
import { BillingOperationResult } from 'types/DataResult';
import { BillingSettings } from 'types/Setting';
import { Utils } from 'utils/Utils';

import { InvoiceComponent } from '../invoice.component';

@Component({
  selector: 'app-invoice-payment',
  templateUrl: 'invoice-payment.component.html',
})
export class InvoicePaymentComponent implements OnInit{
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public currentInvoiceID!: string;
  @Input() public currentUserID!: string;
  @Input() public inDialog!: boolean;
  @Input() public amountWithCurrency!: string;

  public userID!: AbstractControl;
  // Stripe elements
  public elements: StripeElements;
  public cardNumber: StripeCardNumberElement;
  public expirationDate: StripeCardExpiryElement;
  public cvc: StripeCardCvcElement;
  // Errors
  public cardNumberError: string;
  public expirationDateError: string;
  public cvcError: string;

  public invoiceComponent: InvoiceComponent;
  public isCardNumberValid: boolean;
  public isExpirationDateValid: boolean;
  public isCvcValid: boolean;
  public isPayClicked: boolean;
  public invoiceStatus: BillingInvoiceStatus;
  public isPaid: boolean;
  public billingSettings: BillingSettings;
  public constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private stripeService: StripeService,
    private centralServerService: CentralServerService
  ) {
    this.isCardNumberValid = false;
    this.isExpirationDateValid = false;
    this.isCvcValid = false;
    this.isPayClicked = false;
  }

  public ngOnInit(){
    this.loadCardForm();
  }

  public setCurrentUserId(currentUserID: string) {
    this.currentUserID = currentUserID;
  }

  public setCurrentInvoiceId(currentInvoiceID: string) {
    this.currentInvoiceID = currentInvoiceID;
  }

  public setCurrentAmount(amount: string) {
    this.amountWithCurrency = amount;
  }

  public async pay() {
    this.isPayClicked = true;
    await this.doPay();
  }

  public closeDialog(saved: boolean = false) {
    this.dialogRef.close(saved);
  }

  public loadCardForm() {
    void this.initialize();
  }

  public close(saved: boolean = false) {
    this.closeDialog(saved);
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

  private getStripeFacade() {
    return this.stripeService.getStripeFacade();
  }

  private initializeCardElements() {
    this.elements = this.getStripeFacade().elements();
    // Card number element
    this.cardNumber = this.elements.create('cardNumber');
    this.cardNumber.mount('#cardNumber');
    this.cardNumber.on('change', event => {
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

  private async payWithNewPaymentMethod(): Promise<BillingOperationResult> {
    // c.f. STRIPE SAMPLE at: https://stripe.com/docs/billing/subscriptions/fixed-price#collect-payment
    let operationResult = null;
    try {
      this.spinnerService.show();
      // -----------------------------------------------------------------------------------------------
      // Step #0 - Create Setup Intent
      // -----------------------------------------------------------------------------------------------
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
        userID: this.currentUserID
      }).toPromise();
      // -----------------------------------------------------------------------------------------------
      // Step #1 - Confirm the SetupIntent with data provided and carry out 3DS
      // c.f. https://stripe.com/docs/js/setup_intents/confirm_card_setup
      // -----------------------------------------------------------------------------------------------
      const setupIntent: any = response?.internalData;
      this.spinnerService.hide();
      // eslint-disable-next-line max-len
      const result: { setupIntent?: SetupIntent; error?: StripeError } = await this.getStripeFacade().confirmCardSetup( setupIntent.client_secret, {
        payment_method: {
          card: this.cardNumber
        },
      });
      this.spinnerService.show();
      if (result.error) {
        operationResult = result;
      } else {
        // -----------------------------------------------------------------------------------------------
        // Step #2 - Really attach the payment method / not called when 3DS failed
        // -----------------------------------------------------------------------------------------------
        operationResult = await this.finalizeInvoicePayment(result);
        if (operationResult.succeeded) {
          this.isPaid = true;
        }
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
    return operationResult;
  }

  private async finalizeInvoicePayment(operationResult: {setupIntent?: SetupIntent; error?: StripeError}): Promise<BillingOperationResult> {
    // We now know the payment method id
    const paymentMethodID = operationResult.setupIntent?.payment_method;
    // Let's attach the new payment method to the user/customer
    await this.centralServerService.setupPaymentMethod({
      userID: this.currentUserID,
      setupIntentId: operationResult.setupIntent?.id,
      paymentMethodID,
      keepDefaultUnchanged: true
    }).toPromise();
    // Let's try to pay with it
    const response: BillingOperationResult = await this.centralServerService.attemptInvoicePayment({
      userID: this.currentUserID,
      invoiceID: this.currentInvoiceID,
      paymentMethodID,
    }).toPromise();
    return response;
  }

  private async doPay() {
    const operationResult: any = await this.payWithNewPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      if (operationResult.error?.code === 'card_declined') {
        this.isCardNumberValid = false;
        this.messageService.showErrorMessage('settings.billing.payment_methods_create_error_card_declined');
        this.cardNumberError = this.translateService.instant('settings.billing.payment_methods_card_declined');
        this.cardNumber.focus();
      } else {
        this.messageService.showErrorMessage('invoices.invoice_payment_error');
      }
      this.isPayClicked = false;
    } else {
      this.spinnerService.hide();
      // Operation succeeded
      this.messageService.showSuccessMessage('invoices.invoice_payment_success');
      this.close(true);
    }
  }
}
