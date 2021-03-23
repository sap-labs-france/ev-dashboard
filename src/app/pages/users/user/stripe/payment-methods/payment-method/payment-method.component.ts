import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SetupIntent, StripeCardElement, StripeElements, StripeError } from '@stripe/stripe-js';
import { ComponentService } from 'services/component.service';
import { DialogService } from 'services/dialog.service';
import { StripeService } from 'services/stripe.service';
import { WindowService } from 'services/window.service';
import { BillingOperationResponse } from 'types/DataResult';
import TenantComponents from 'types/TenantComponents';

import { CentralServerService } from '../../../../../../services/central-server.service';
import { MessageService } from '../../../../../../services/message.service';
import { SpinnerService } from '../../../../../../services/spinner.service';
import { Utils } from '../../../../../../utils/Utils';
import { PaymentMethodDialogComponent } from './payment-method.dialog.component';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
})

export class PaymentMethodComponent implements OnInit {

  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<PaymentMethodDialogComponent>;
  @Input() public currentUserID!: string;
  @ViewChild('cardInfo', { static: true }) public cardInfo: ElementRef;
  public feedback: any;
  public elements: StripeElements;
  public card: StripeCardElement;
  public formGroup!: FormGroup;
  public isBillingComponentActive: boolean;
  public userID: string;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private router: Router,
    private dialogService: DialogService,
    private componentService: ComponentService,
    private translateService: TranslateService,
    private windowService: WindowService,
    private dialog: MatDialog) {
      this.isBillingComponentActive = this.componentService.isActive(TenantComponents.BILLING);
  }

  public ngOnInit(): void {
    this.initialize();
    this.userID = this.dialogRef.componentInstance.userID;
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      const stripeFacade = await this.stripeService.initializeStripe();
      if ( !stripeFacade ) {
        this.feedback = 'Stripe configuration is not set for the current tenant';
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
    this.card = this.elements.create('card', {hidePostalCode: true});
    this.card.mount(this.cardInfo.nativeElement);
  }

  public linkCardToAccount() {
    this.doCreatePaymentMethod();
  }

  private async doCreatePaymentMethod() {
    const operationResult: any = await this.createPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      this.messageService.showErrorMessage('settings.billing.payment_methods_create_error');
    } else {
      this.spinnerService.hide();
      // Operation succeeded
      this.messageService.showSuccessMessage('settings.billing.payment_methods_create_success', { last4: operationResult.internalData.card.last4 });
      this.closeDialog(true);
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

      const response: BillingOperationResponse = await this.centralServerService.setupPaymentMethod({
        userID: this.userID
      }).toPromise();

      // -----------------------------------------------------------------------------------------------
      // Step #1 - Confirm the SetupIntent with data provided and carry out 3DS
      // c.f. https://stripe.com/docs/js/setup_intents/confirm_card_setup
      // -----------------------------------------------------------------------------------------------

      const setupIntent: any = response?.internalData;
      // TODO: handle spinner .hide / .show in a better way - if we're quick we can re click save before 3d secure popup shows off
      // if 3d secure doesn't show spinner hide/show and the same we can re click on the save button
      // settimeout doesn't work as expected - it never hides...
      // setTimeout(function() {
        this.spinnerService.hide();
      // }, 4000);
      const result: {setupIntent?: SetupIntent; error?: StripeError} = await this.getStripeFacade().confirmCardSetup( setupIntent.client_secret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.centralServerService.getCurrentUserSubject().value.email + new Date(),
          },
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
      const response: BillingOperationResponse = await this.centralServerService.setupPaymentMethod({
        setupIntentId: operationResult.setupIntent?.id,
        paymentMethodId: operationResult.setupIntent?.payment_method,
        userID: this.userID
      }).toPromise();
      return response;
    }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.createPaymentMethod.bind(this), this.closeDialog.bind(this));
  }

  public closeDialog(saved: boolean = false) {
    if (this.inDialog) {
      this.dialogRef.close(saved);
    }
  }
}

