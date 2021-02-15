import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Stripe, StripeCardElement, StripeElements } from '@stripe/stripe-js';
// Lazy loading of stripe script
import { loadStripe } from '@stripe/stripe-js/pure';
import { ActionResponse } from 'types/DataResult';
import { User } from 'types/User';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { HTTPError } from '../../../types/HTTPError';
import { BillingSettings, BillingSettingsType } from '../../../types/Setting';
import TenantComponents from '../../../types/TenantComponents';
import { Utils } from '../../../utils/Utils';

//declare var Stripe: any;

@Component({
  selector: 'app-stripe-template',
  templateUrl: './stripe-template.component.html',
  styleUrls: ['./stripe-template.component.scss']
})

export class StripeTemplateComponent implements OnInit {

  // TODO - Clarify the life-cycle - ONLY a single STRIPE instance can be loaded and initialized!
  private static stripeFacade: Stripe;
  // Billing & Billing Information
  public isActive = false;
  public billingSettings!: BillingSettings;

  @ViewChild('cardInfo', { static: true }) cardInfo: ElementRef;
  feedback: any;
  elements: StripeElements;
  card: StripeCardElement;

  //constructor(private stripeScriptService: StripeScriptService) {}
  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    // private dialogService: DialogService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    // private translateService: TranslateService,
    private router: Router,
  ) {
    this.isActive = this.componentService.isActive(TenantComponents.BILLING);
  }

  ngOnInit(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      this.billingSettings = await this.loadBillingConfiguration();
      if ( !this.billingSettings || !this.billingSettings.stripe ) {
        this.feedback = "Stripe configuration is not set for the current tenant";
      } else {
        await this.initializeStripe(this.billingSettings.stripe.publicKey);
        this.initializeCardElements();
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
  }

  private async initializeStripe(publicKey: string) : Promise<Stripe> {
    if ( !StripeTemplateComponent.stripeFacade ) {
      loadStripe.setLoadParameters({ advancedFraudSignals: false })
      StripeTemplateComponent.stripeFacade = await loadStripe(publicKey);
    }
    return StripeTemplateComponent.stripeFacade;
  }

  private getStripeFacade() {
    return StripeTemplateComponent.stripeFacade;
  }

  private initializeCardElements() {
    this.elements = this.getStripeFacade().elements();
    this.card = this.elements.create('card');
    this.card.mount(this.cardInfo.nativeElement);
  }

  private async loadBillingConfiguration(): Promise<BillingSettings> {
    try {
      return await this.componentService.getBillingSettings().toPromise();
    } catch (error) {
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    }
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
