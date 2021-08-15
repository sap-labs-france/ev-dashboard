import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentIntent, PaymentMethod, SetupIntent, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements, StripeError } from '@stripe/stripe-js';
import { CentralServerService } from 'services/central-server.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { StripeService } from 'services/stripe.service';
import { AppCurrencyPipe } from 'shared/formatters/app-currency.pipe';
// import { TablePayInvoiceAction } from 'shared/table/actions/invoices/table-pay-invoice-action';
import { BillingInvoiceStatus } from 'types/Billing';
import { BillingOperationResult } from 'types/DataResult';
import { BillingSettings } from 'types/Setting';
import { Utils } from 'utils/Utils';

import { InvoiceComponent } from '../invoice.component';

// import { InvoicePaymentDialogComponent } from './invoice-payment.dialog.component';

@Component({
  selector: 'app-invoice-payment',
  templateUrl: 'invoice-payment.component.html',
})
export class InvoicePaymentComponent implements OnInit{
  @Input() public dialogRef!: MatDialogRef<any>;
  @Input() public currentInvoiceID!: string;
  @Input() public currentUserID!: string;
  @Input() public formGroup!: FormGroup;
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
  public hasAcceptedConditions: boolean;
  public isCardNumberValid: boolean;
  public isExpirationDateValid: boolean;
  public isCvcValid: boolean;
  public isSaveClicked: boolean;
  public invoiceStatus: BillingInvoiceStatus;
  public isPaid: boolean;
  public billingSettings: BillingSettings;
  public constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private appCurrencyPipe: AppCurrencyPipe,
    private stripeService: StripeService,
    private centralServerService: CentralServerService,
    private dialog: MatDialog
  ) {
    this.isCardNumberValid = false;
    this.isExpirationDateValid = false;
    this.isCvcValid = false;
    this.isSaveClicked = false;
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

  public async callInvoicePaymentBack() {
    await this.doCreatePaymentMethod();
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

  private async createPaymentMethod(): Promise<any> {
    // c.f. STRIPE SAMPLE at: https://stripe.com/docs/billing/subscriptions/fixed-price#collect-payment
    let operationResult = null;
    try {
      this.spinnerService.show();
      // -----------------------------------------------------------------------------------------------
      // Step #0 - Create Setup Intent
      // -----------------------------------------------------------------------------------------------

      //Below to test new payment intents
      // const response: BillingOperationResult = await this.centralServerService.setupPaymentIntent({
      //   userID: this.currentUserID,
      //   invoiceID: this.currentInvoiceID
      // }).toPromise();


      // Below to use the same process as payment method
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
        userID: this.currentUserID,
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
      // // }, 4000);
      // eslint-disable-next-line max-len
      const confirmResult: { setupIntent?: SetupIntent; error?: StripeError } = await this.getStripeFacade().confirmCardSetup( setupIntent.client_secret, {
        payment_method: {
          card: this.cardNumber
          // TODO: put email and address
          // billing_details: {
          //   name: this.centralServerService.getCurrentUserSubject().value.email + new Date(),
          // },
        },
      });
      this.spinnerService.show();
      if (confirmResult.error) {
        operationResult = response;
      } else {
        const attachResult = await this.attachPaymentMethod(confirmResult);
        if (attachResult.error) {
          operationResult = response;
        } else {
          const paymentMethod: any = attachResult.internalData;
          operationResult = await this.finalizeInvoicePayment(paymentMethod.id);
        }
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
  private async attachPaymentMethod(result: {setupIntent?: SetupIntent; error?: StripeError}) {
    const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
      // setupIntentId: result.setupIntent?.id,
      paymentMethodID: result.setupIntent?.payment_method,
      userID: this.currentUserID,
      oneTimePayment: true
    }).toPromise();
    return response;
  }

  // -----------------------------------------------------------------------------------------------
  // Step #3 - Pay invoice once creating/attaching payment method succeeded
  // -----------------------------------------------------------------------------------------------
  private async finalizeInvoicePayment(paymentMethodID: string) {
    const response: BillingOperationResult = await this.centralServerService.processInvoicePayment({
      userID: this.currentUserID,
      invoiceID: this.currentInvoiceID,
      paymentMethodID
    }).toPromise();
    return response;
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
}
