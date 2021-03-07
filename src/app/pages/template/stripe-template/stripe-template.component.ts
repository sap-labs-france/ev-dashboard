import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SetupIntent, StripeCardElement, StripeElements, StripeError } from '@stripe/stripe-js';
import { StripeService } from 'services/stripe.service';
import { ActionResponse, BillingOperationResponse } from 'types/DataResult';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-stripe-template',
  templateUrl: './stripe-template.component.html',
  styleUrls: ['./stripe-template.component.scss']
})

export class StripeTemplateComponent implements OnInit {

  @ViewChild('cardInfo', { static: true }) public cardInfo: ElementRef;
  public feedback: any;
  public elements: StripeElements;
  public card: StripeCardElement;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private stripeService: StripeService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.initialize();
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

  private openTestingCardsUrl() {
    // TBC - This has a side effect - it will load stripe.js twice and hang forever!!!
    window.open('https://stripe.com/docs/testing#cards', '_blank');
  }

  public linkCardToAccount() {
    this.doCreatePaymentMethod();
  }

  private async doCreatePaymentMethod() {
    const operationResult: any = await this.createPaymentMethod();
    if (operationResult.error) {
      // Operation failed
      this.feedback = operationResult.error.message;
    } else {
      // Operation succeeded
      this.feedback = operationResult;
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

      const response: BillingOperationResponse = await this.centralServerService.setupPaymentMethod({}).toPromise();

      // -----------------------------------------------------------------------------------------------
      // Step #1 - Confirm the SetupIntent with data provided and carry out 3DS
      // c.f. https://stripe.com/docs/js/setup_intents/confirm_card_setup
      // -----------------------------------------------------------------------------------------------

      this.spinnerService.hide();
      const setupIntent: any = response?.internalData;
      const result: {setupIntent?: SetupIntent; error?: StripeError} = await this.getStripeFacade().confirmCardSetup( setupIntent.client_secret, {
        payment_method: {
          card: this.card,
          billing_details: {
            //TODO - does it make sense here to keep track of how userID - for troubleshooting purposes only?
            name: 'Jenny Rosen ' + new Date(),
          },
        },
      });
      console.log('RESULT FROM CONFIRM SETUP');
      console.log(result);
      if (result.error?.code) {
        // TODO - provide a clear feedback depending on the error code?
        // e.g. 'setup_intent_authentication_failure', "card_declined", etc
        // exhaustive list at: https://stripe.com/docs/declines/codes
        operationResult = result;
        // TODO - how to log the fact that the user did an attempt which was refused?
        // No call to our the backend? no traces in our logs?
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
      }).toPromise();
      return response;
    }
  }
