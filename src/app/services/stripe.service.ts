import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { StatusCodes } from 'http-status-codes';
import { BillingSettings } from 'types/Setting';
import { Constants } from 'utils/Constants';
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
    private router: Router
  ) {}

  public async initializeStripe(): Promise<Stripe> {
    if (!StripeService.stripeFacade) {
      const billingSettings = await this.loadBillingConfiguration();
      if (billingSettings?.stripe?.publicKey) {
        loadStripe.setLoadParameters({ advancedFraudSignals: false });
        StripeService.stripeFacade = await loadStripe(billingSettings.stripe.publicKey);
        // Set application info to let STRIPE know that the account belongs to our solution
        StripeService.stripeFacade.registerAppInfo({
          name: Constants.STRIPE_APP_NAME,
          partner_id: Constants.STRIPE_PARTNER_ID,
        });
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
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'general.unexpected_error_backend'
          );
      }
    }
  }
}
