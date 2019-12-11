import { Injectable } from '@angular/core';
// tslint:disable-next-line:max-line-length
import { ActionResponse, AnalyticsSettings, BillingSettings, BillingSettingsType, OcpiSettings, PricingSettings, PricingSettingsType, RefundSettings, RefundSettingsType, SmartChargingSettings, SmartChargingSettingsType } from 'app/common.types';
import { Observable } from 'rxjs';
import { CentralServerService } from './central-server.service';

export enum ComponentType {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  PRICING = 'pricing',
  BILLING = 'billing',
  REFUND = 'refund',
  STATISTICS = 'statistics',
  ANALYTICS = 'analytics',
  SMART_CHARGING = 'smartCharging',
}

@Injectable()
export class ComponentService {
  private activeComponents!: string[]|null;

  constructor(
    private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      if (user && user.activeComponents) {
        this.activeComponents = user.activeComponents;
      } else {
        this.activeComponents = null;
      }
    });
  }

  public isActive(componentName: ComponentType): boolean {
    if (this.activeComponents) {
      return this.activeComponents.includes(componentName);
    }
    return false;
  }

  public getActiveComponents(): string[]|null {
    return this.activeComponents;
  }

  public getPricingSettings(): Observable<PricingSettings> {
    return new Observable((observer) => {
      const pricingSettings = {
        identifier: ComponentType.PRICING,
      } as PricingSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentType.PRICING).subscribe((settings) => {
        // Get the currency
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // ID
          pricingSettings.id = settings.result[0].id;
          pricingSettings.sensitiveData = settings.result[0].sensitiveData;
          // Simple price
          if (config.simple) {
            pricingSettings.type = PricingSettingsType.SIMPLE;
            pricingSettings.simple = {
              price: config.simple.price ? parseFloat(config.simple.price) : 0,
              currency: config.simple.currency ? config.simple.currency : '',
            };
          }
          // Convergeant Charging
          if (config.convergentCharging) {
            pricingSettings.type = PricingSettingsType.CONVERGENT_CHARGING;
            pricingSettings.convergentCharging = {
              url: config.convergentCharging.url ? config.convergentCharging.url : '',
              chargeableItemName: config.convergentCharging.chargeableItemName ? config.convergentCharging.chargeableItemName : '',
              user: config.convergentCharging.user ? config.convergentCharging.user : '',
              password: config.convergentCharging.password ? config.convergentCharging.password : '',
            };
          }
        }
        observer.next(pricingSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public savePricingSettings(settings: PricingSettings): Observable<ActionResponse> {
    // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.PRICING,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    if (settings.type === PricingSettingsType.CONVERGENT_CHARGING) {
      // @ts-ignore
      settingsToSave.sensitiveData = ['content.convergentCharging.password'];
    }
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveBillingSettings(settings: BillingSettings): Observable<ActionResponse> {
    // Check the type
    if (!settings.type) {
      settings.type = BillingSettingsType.STRIPE;
    }
     // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.BILLING,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    if (settings.type === BillingSettingsType.STRIPE) {
      // @ts-ignore
      settingsToSave.sensitiveData = ['content.stripe.secretKey'];
    }
    // Set some temporary defaults
    settingsToSave.content.stripe.noCardAllowed = true;
    settingsToSave.content.stripe.advanceBillingAllowed = false;
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveRefundSettings(settings: RefundSettings): Observable<ActionResponse> {
    // Check the type
    if (!settings.type) {
      settings.type = RefundSettingsType.CONCUR;
    }
    // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.REFUND,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    if (settings.type === RefundSettingsType.CONCUR) {
      // @ts-ignore
      settingsToSave.sensitiveData = ['content.concur.clientSecret'];
    }
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveOcpiSettings(settings: OcpiSettings): Observable<ActionResponse> {
    // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.OCPI,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveSacSettings(settings: AnalyticsSettings): Observable<ActionResponse> {
    // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.ANALYTICS,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveSmartChargingSettings(settings: SmartChargingSettings): Observable<ActionResponse> {
    // build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: ComponentType.SMART_CHARGING,
      sensitiveData: [],
      content: JSON.parse(JSON.stringify(settings)),
    };
    if (settings.type === SmartChargingSettingsType.SAP_SMART_CHARGING) {
      // @ts-ignore
      settingsToSave.sensitiveData = ['content.sapSmartCharging.password'];
    }
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public getBillingSettings(): Observable<BillingSettings> {
    return new Observable((observer) => {
      const billingSettings = {
        identifier: ComponentType.BILLING,
      } as BillingSettings;
      // Get the Billing settings
      this.centralServerService.getSettings(ComponentType.BILLING).subscribe((settings) => {
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // ID
          billingSettings.id = settings.result[0].id;
          billingSettings.sensitiveData = settings.result[0].sensitiveData;
          // Stripe
          if (config.stripe) {
            billingSettings.type = BillingSettingsType.STRIPE;
            billingSettings.stripe = config.stripe;
          }
        }
        observer.next(billingSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getOcpiSettings(): Observable<OcpiSettings> {
    return new Observable((observer) => {
      const ocpiSettings = {
        identifier: ComponentType.OCPI,
      } as OcpiSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentType.OCPI).subscribe((settings) => {
        // Get the currency
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // Set
          ocpiSettings.id = settings.result[0].id;
          ocpiSettings.sensitiveData = settings.result[0].sensitiveData;
          ocpiSettings.ocpi = config.ocpi;
        }
        observer.next(ocpiSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getSacSettings(contentFilter = false): Observable<AnalyticsSettings> {
    return new Observable((observer) => {
      const analyticsSettings = {
        identifier: ComponentType.ANALYTICS,
      } as AnalyticsSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentType.ANALYTICS, contentFilter).subscribe((settings) => {
        // Get the currency
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // Set
          analyticsSettings.id = settings.result[0].id;
          analyticsSettings.sensitiveData = settings.result[0].sensitiveData;
          analyticsSettings.sac = config.sac;
          analyticsSettings.links = config.links;
        }
        observer.next(analyticsSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getRefundSettings(): Observable<RefundSettings> {
    return new Observable((observer) => {
      const refundSettings = {
        identifier: ComponentType.REFUND,
      } as RefundSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentType.REFUND).subscribe((settings) => {
        // Get the currency
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // ID
          refundSettings.id = settings.result[0].id;
          // Sensitive data
          refundSettings.sensitiveData = settings.result[0].sensitiveData;
          // Set
          refundSettings.concur = config.concur;
        }
        observer.next(refundSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }


  public getSmartChargingSettings(contentFilter = false): Observable<SmartChargingSettings> {
    return new Observable((observer) => {
      const smartChargingSettings = {
        identifier: ComponentType.SMART_CHARGING,
      } as SmartChargingSettings;
      // Get the SmartCharging settings
      this.centralServerService.getSettings(ComponentType.SMART_CHARGING, contentFilter).subscribe((settings) => {
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // Set
          smartChargingSettings.id = settings.result[0].id;
          smartChargingSettings.sensitiveData = settings.result[0].sensitiveData;
          smartChargingSettings.sapSmartCharging = config.sapSmartCharging;
        }
        observer.next(smartChargingSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

}
