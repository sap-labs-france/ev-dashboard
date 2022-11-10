import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { StatusCodes } from 'http-status-codes';
import { BillingAccount } from 'types/Billing';
import { HTTPError } from 'types/HTTPError';
import { BillingSettings } from 'types/Setting';
import { Utils } from 'utils/Utils';

import { CentralServerService } from './central-server.service';
import { ComponentService } from './component.service';
import { MessageService } from './message.service';

@Injectable()
export class StripeService {

  private static stripeFacade: Stripe;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private messageService: MessageService,
    private router: Router,
  ) {
  }

  public async initializeStripe(): Promise<Stripe> {
    if (!StripeService.stripeFacade) {
      const billingSettings = await this.loadBillingConfiguration();
      if (billingSettings?.stripe?.publicKey) {
        loadStripe.setLoadParameters({ advancedFraudSignals: false });
        StripeService.stripeFacade = await loadStripe(billingSettings.stripe.publicKey);
      }
    }
    return StripeService.stripeFacade;
  }

  public async initializeStripeForScanAndPay(): Promise<Stripe> {
    if (!StripeService.stripeFacade) {
      const billingSettings = await this.loadBillingConfigurationScanAndPay();
      if (billingSettings?.stripe?.publicKey) {
        loadStripe.setLoadParameters({ advancedFraudSignals: false });
        StripeService.stripeFacade = await loadStripe(billingSettings.stripe.publicKey);
      }
    }
    return StripeService.stripeFacade;
  }

  public getStripeFacade() {
    return StripeService.stripeFacade;
  }

  private async loadBillingConfiguration(): Promise<BillingSettings> {
    try {
      return await this.componentService.getBillingSettings().toPromise();
    } catch (error) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          this.messageService.showErrorMessage('settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    }
  }

  private async loadBillingConfigurationScanAndPay(): Promise<BillingSettings> {
    try {
      return await this.componentService.getBillingSettingsSanAndPay().toPromise();
    } catch (error) {
      switch (error.status) {
        case StatusCodes.NOT_FOUND:
          this.messageService.showErrorMessage('settings.billing.not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    }
  }
}
