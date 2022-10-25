import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SetupIntent, StripeElementLocale, StripeElements, StripeElementsOptions, StripeError, StripePaymentElement } from '@stripe/stripe-js';

import { CentralServerService } from '../../services/central-server.service';
import { ComponentService } from '../../services/component.service';
import { LocaleService } from '../../services/locale.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { StripeService } from '../../services/stripe.service';
import { BillingOperationResult } from '../../types/DataResult';
import { TenantComponents } from '../../types/Tenant';
import { Utils } from '../../utils/Utils';
import { PaymentMethodDialogComponent } from '../dialogs/payment-methods/payment-method.dialog.component';

@Component({
  selector: 'app-stripe-element',
  templateUrl: 'stripe-element.component.html',
  styleUrls: ['stripe-element.component.scss']
})
export class StripeElementComponent implements OnInit {
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PaymentMethodDialogComponent>;
  @Input() public currentUserID!: string;
  public formGroup!: UntypedFormGroup;
  public isBillingComponentActive: boolean;
  public userID: string;
  public acceptConditions: AbstractControl;
  // Stripe elements
  public elements: StripeElements;
  public paymentElement: StripePaymentElement;
  // conditions to enable Save
  public hasAcceptedConditions: boolean;
  public isSaveClicked: boolean;

  public constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private router: Router,
    private componentService: ComponentService,
    public translateService: TranslateService,
    private localeService: LocaleService) {
    this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
    this.hasAcceptedConditions = false;
    this.isSaveClicked = false;
  }

  public ngOnInit(): void {
    void this.initialize();
    this.userID = this.dialogRef.componentInstance.userID;
    this.formGroup = new UntypedFormGroup({
      acceptConditions: new UntypedFormControl()
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
      // Step #1 - Create A STRIPE Setup Intent
      const setupIntent: SetupIntent = await this.createSetupIntent();
      if ( !stripeFacade ) {
        this.messageService.showErrorMessage('settings.billing.not_properly_set');
      } else {
        this.initializeElements(setupIntent);
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

  private initializeElements(setupIntent: SetupIntent) {
    const language = this.localeService.getLocaleInformation()?.language;
    const options: StripeElementsOptions = {
      locale: language as StripeElementLocale,
      clientSecret: setupIntent.client_secret
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
      this.isSaveClicked = false;
    } else {
      // Operation succeeded
      this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', { last4: operationResult.internalData.card.last4 });
      this.close(true);
    }
  }

  private async createPaymentMethod(): Promise<any> {
    try {
      // Step #1 - Confirm the STRIPE Setup Intent to carry out 3DS authentication (redirects to the bank authentication page)
      const confirmationResult = await this.confirmSetupIntent();
      if (confirmationResult.error) {
        // 3DS authentication has been aborted or user was not able to authenticate
        return confirmationResult;
      }
      // Step #2 - Now attach the payment method to the user
      return this.attachPaymentMethod(confirmationResult);
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    }
  }

  private async createSetupIntent(): Promise<any> {
    try {
      this.spinnerService.show();
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
        userID: this.userID
      }).toPromise();
      return response?.internalData;
    } finally {
      this.spinnerService.hide();
    }
  }

  private async confirmSetupIntent(): Promise<{ setupIntent?: SetupIntent; error?: StripeError }> {
    const result = await this.getStripeFacade().confirmSetup({
      elements : this.elements,
      redirect: 'if_required'
    });
    return result;
  }

  private async attachPaymentMethod(operationResult: {setupIntent?: SetupIntent; error?: StripeError}) {
    try {
      this.spinnerService.show();
      const response: BillingOperationResult = await this.centralServerService.setupPaymentMethod({
        setupIntentId: operationResult.setupIntent?.id,
        paymentMethodId: operationResult.setupIntent?.payment_method,
        userID: this.userID
      }).toPromise();
      return response;
    } finally {
      this.spinnerService.hide();
    }
  }
}
