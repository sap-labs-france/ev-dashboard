import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StripeCardElement, StripeElements } from '@stripe/stripe-js';
import { StripeService } from 'services/stripe.service';
import { ActionResponse, BillingOperationResponse } from 'types/DataResult';

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
    let operationResult=null;

    try {
      this.spinnerService.show();

      //-----------------------------------------------------------------------------------------------
      // Step #0 - Create Setup Intent
      //-----------------------------------------------------------------------------------------------
      const response: BillingOperationResponse = await this.centralServerService.attachPaymentMethod({
        // paymentMethodId: operationResult.paymentMethod.id
      }).toPromise();

      if ( response ) {
        const setupIntent: any = response.internalData;
        if (setupIntent.status === 'requires_payment_method') {
          // The setup inten requires additional actions, such as authenticating with 3D Secure
          this.spinnerService.hide();
          //-----------------------------------------------------------------------------------------------
          // Step #1 - client-side  - Calling stripe to validate the setup intent
          //-----------------------------------------------------------------------------------------------
          operationResult = await this.getStripeFacade().confirmCardSetup(setupIntent.client_secret, {
            payment_method: {
              card: this.card,
              billing_details: {
                name: "Just a stripe test",
              },
            }
          });
          this.spinnerService.show();
          
          if (!operationResult.error && operationResult?.setupIntent?.payment_method) {
            const response: BillingOperationResponse = await this.centralServerService.attachPaymentMethod({
              setupIntentId: operationResult?.setupIntent?.id,
              paymentMethodId: operationResult?.setupIntent?.payment_method,
            }).toPromise();
          }

        } else {
          operationResult = response.internalData;
        }
            
        // let operationResult = await this.getStripeFacade().createPaymentMethod({
        //   type: 'card',
        //   card: this.card,
        //   billing_details: {
        //     name: "Just a stripe test",
        //   },
        // })
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
    return operationResult;
  }

}
