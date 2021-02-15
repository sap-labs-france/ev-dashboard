import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { StripeService } from 'services/stripe.service';
import { ActionResponse } from 'types/DataResult';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { Utils } from '../../../utils/Utils';

//declare var Stripe: any;

@Component({
  selector: 'app-stripe-template',
  templateUrl: './stripe-template.component.html',
  styleUrls: ['./stripe-template.component.scss']
})

export class StripeTemplateComponent implements OnInit {

  @ViewChild('cardInfo', { static: true }) cardInfo: ElementRef;
  feedback: any;
  elements: StripeElements;
  card: StripeCardElement;

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
        this.feedback = "Stripe configuration is not set for the current tenant";
      }
      else {
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
    this.card = this.elements.create('card');
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
    const operationResult: any = await this.createPaymentMethod()
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
    try {
      this.spinnerService.show();
      //-----------------------------------------------------------------------------------------------
      // Step #1 - client-side  - Calling stripe to create a payment method
      //-----------------------------------------------------------------------------------------------
      let operationResult = await this.getStripeFacade().createPaymentMethod({
        type: 'card',
        card: this.card,
        billing_details: {
          name: "Just a stripe test",
        },
      })
      //-----------------------------------------------------------------------------------------------
      // Step #2 - server-side  - call or rest end-point to attach the payment method to the customer
      //-----------------------------------------------------------------------------------------------
      if (!operationResult.error) {
        const response: ActionResponse = await this.centralServerService.attachPaymentMethod({
          paymentMethodId: operationResult.paymentMethod.id
        }).toPromise();
        // TODO - check response status!
      }
      //-----------------------------------------------------------------------------------------------
      // Step #3 - check if something else must be done
      //-----------------------------------------------------------------------------------------------
      if (operationResult.error) {
        // ##CR - TBC!
      }
      return operationResult;
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
  }

}
