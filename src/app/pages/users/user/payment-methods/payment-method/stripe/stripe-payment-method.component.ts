import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  SetupIntent,
  StripeCardCvcElement,
  StripeCardExpiryElement,
  StripeCardNumberElement,
  StripeElements,
  StripeError,
} from '@stripe/stripe-js';
import { ComponentService } from 'services/component.service';
import { StripeService } from 'services/stripe.service';
import { BillingOperationResult } from 'types/DataResult';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../../../../services/central-server.service';
import { MessageService } from '../../../../../../services/message.service';
import { SpinnerService } from '../../../../../../services/spinner.service';
import { Utils } from '../../../../../../utils/Utils';
import { PaymentMethodDialogComponent } from '../payment-method.dialog.component';

@Component({
  selector: 'app-stripe-payment-method',
  templateUrl: 'stripe-payment-method.component.html',
  styleUrls: ['stripe-payment-method.component.scss'],
})
export class StripePaymentMethodComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PaymentMethodDialogComponent>;
  @Input() public currentUserID!: string;
  @ViewChild('cardInfo', { static: true }) public cardInfo: ElementRef;
  public formGroup!: UntypedFormGroup;
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
    public translateService: TranslateService
  ) {
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.hasAcceptedConditions = false;
    this.isCardNumberValid = false;
    this.isExpirationDateValid = false;
    this.isCvcValid = false;
    this.isSaveClicked = false;
  }

  public ngOnInit(): void {
    void this.initialize();
    this.userID = this.dialogRef.componentInstance.userID;
    this.formGroup = new UntypedFormGroup({
      acceptConditions: new UntypedFormControl(),
    });
    this.acceptConditions = this.formGroup.controls['acceptConditions'];
  }

  public handleAcceptConditions() {
    this.hasAcceptedConditions = !this.hasAcceptedConditions;
  }

  public linkCardToAccount() {
    this.isSaveClicked = true;
    void this.doCreatePaymentMethod();
  }

  public close(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      const stripeFacade = await this.stripeService.initializeStripe();
      if (!stripeFacade) {
        this.messageService.showErrorMessage('settings.billing.not_properly_set');
      } else {
        this.initializeCardElements();
      }
    } catch (error) {
      Utils.handleHttpError(
        error,
        this.router,
        this.messageService,
        this.centralServerService,
        'general.unexpected_error_backend'
      );
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
    this.cardNumber.on('change', (event) => {
      this.cardNumberError = event.error
        ? this.translateService.instant('settings.billing.payment_methods_card_number_error')
        : '';
      this.isCardNumberValid = !event.error && event.complete;
    });
    // Card expiry element
    this.expirationDate = this.elements.create('cardExpiry');
    this.expirationDate.mount('#cardExp');
    this.expirationDate.on('change', (event) => {
      this.expirationDateError = event.error
        ? this.translateService.instant('settings.billing.payment_methods_expiration_date_error')
        : '';
      this.isExpirationDateValid = !event.error && event.complete;
    });
    // Card CVC element
    this.cvc = this.elements.create('cardCvc');
    this.cvc.mount('#cardCvc');
    this.cvc.on('change', (event) => {
      this.cvcError = event.error
        ? this.translateService.instant('settings.billing.payment_methods_cvc_error')
        : '';
      this.isCvcValid = !event.error && event.complete;
    });
  }

  private async doCreatePaymentMethod() {
    const operationResult: any = await this.createPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      if (operationResult.error.code === 'card_declined') {
        this.isCardNumberValid = false;
        this.messageService.showErrorMessage(
          'settings.billing.payment_methods_create_error_card_declined'
        );
        this.cardNumberError = this.translateService.instant(
          'settings.billing.payment_methods_card_declined'
        );
        this.cardNumber.focus();
      } else {
        this.messageService.showErrorMessage('settings.billing.payment_methods_create_error');
      }
      this.isSaveClicked = false;
    } else {
      // Operation succeeded
      this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', {
        last4: operationResult.internalData.card.last4,
      });
      this.close(true);
    }
  }

  private async createPaymentMethod(): Promise<any> {
    try {
      // Step #1 - Create A STRIPE Setup Intent
      const setupIntent = await this.createSetupIntent();
      // Step #2 - Confirm the STRIPE Setup Intent to carry out 3DS authentication (redirects to the bank authentication page)
      const confirmationResult = await this.confirmSetupIntent(setupIntent);
      if (confirmationResult.error) {
        // 3DS authentication has been aborted or user was not able to authenticate
        return confirmationResult;
      }
      // Step #3 - Now attach the payment method to the user
      return this.attachPaymentMethod(confirmationResult);
    } catch (error) {
      Utils.handleHttpError(
        error,
        this.router,
        this.messageService,
        this.centralServerService,
        'general.unexpected_error_backend'
      );
    }
  }

  private async createSetupIntent(): Promise<any> {
    try {
      this.spinnerService.show();
      const response: BillingOperationResult = await this.centralServerService
        .setupPaymentMethod({
          userID: this.userID,
        })
        .toPromise();
      return response?.internalData;
    } finally {
      this.spinnerService.hide();
    }
  }

  private async confirmSetupIntent(
    setupIntent: any
  ): Promise<{ setupIntent?: SetupIntent; error?: StripeError }> {
    const result: { setupIntent?: SetupIntent; error?: StripeError } =
      await this.getStripeFacade().confirmCardSetup(setupIntent.client_secret, {
        payment_method: {
          card: this.cardNumber,
        },
      });
    return result;
  }

  private async attachPaymentMethod(operationResult: {
    setupIntent?: SetupIntent;
    error?: StripeError;
  }) {
    try {
      this.spinnerService.show();
      const response: BillingOperationResult = await this.centralServerService
        .setupPaymentMethod({
          setupIntentId: operationResult.setupIntent?.id,
          paymentMethodId: operationResult.setupIntent?.payment_method,
          userID: this.userID,
        })
        .toPromise();
      return response;
    } finally {
      this.spinnerService.hide();
    }
  }
}
