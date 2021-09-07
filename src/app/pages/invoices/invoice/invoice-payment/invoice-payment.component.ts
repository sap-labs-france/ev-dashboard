import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentIntent, StripeCardCvcElement, StripeCardExpiryElement, StripeCardNumberElement, StripeElements, StripeError } from '@stripe/stripe-js';
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
    let operationResult = null;
    try {
      this.spinnerService.show();
      // -----------------------------------------------------------------------------------------------
      // Step #0 - Create a Payment Intent
      // -----------------------------------------------------------------------------------------------
      const response: BillingOperationResult = await this.centralServerService.createPaymentIntent({
        userID: this.currentUserID,
        invoiceID: this.currentInvoiceID
      }).toPromise();
      // -----------------------------------------------------------------------------------------------
      // Step #1 - Confirm the PaymentIntent with data provided and carry out 3DS
      // -----------------------------------------------------------------------------------------------
      const paymentIntent: any = response?.internalData;
      this.spinnerService.hide();
      // eslint-disable-next-line max-len
      const confirmResult: { paymentIntent?: PaymentIntent; error?: StripeError } = await this.getStripeFacade().confirmCardPayment( paymentIntent.client_secret, {
        payment_method: {
          card: this.cardNumber
        },
        setup_future_usage: 'off_session' // TODO - we should get rid of it!
      });
      this.spinnerService.show();
      if (confirmResult.error) {
        operationResult = response;
      } else {
        // ---------------------------------------------------------------
        // Step #2 - Use the confirmed payment intent to pay the invoice
        // ---------------------------------------------------------------
        const paymentMethodId: string = confirmResult.paymentIntent.payment_method;
        operationResult = await this.finalizeInvoicePayment(paymentMethodId);
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

  private async finalizeInvoicePayment(paymentMethodID: string) {
    const response: BillingOperationResult = await this.centralServerService.attemptInvoicePayment({
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
