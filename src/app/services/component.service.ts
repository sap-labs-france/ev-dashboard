import { Injectable } from '@angular/core';
// tslint:disable-next-line:max-line-length
import { ActionResponse, AnalyticsSettings, OcpiSettings, PricingSettings, PricingSettingsType, RefundSettings, RefundSettingsType } from 'app/common.types';
import { Observable } from 'rxjs';
import { CentralServerService } from './central-server.service';

export enum ComponentEnum {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  PRICING = 'pricing',
  REFUND = 'refund',
  STATISTICS = 'statistics',
  ANALYTICS = 'analytics'
}

@Injectable()
export class ComponentService {
  private activeComponents?: Array<string>;

  constructor(
    private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe(user => {
      if (user) {
        this.activeComponents = user.activeComponents;
      } else {
        this.activeComponents = null;
      }
    });
  }

  public isActive(componentName: ComponentEnum): boolean {
    if (this.activeComponents) {
      return this.activeComponents.includes(componentName);
    }
    return false;
  }

  public getActiveComponents(): string[] {
    return this.activeComponents;
  }

  public getPricingSettings(): Observable<PricingSettings> {
    return new Observable((observer) => {
      const pricingSettings = {
        identifier: ComponentEnum.PRICING
      } as PricingSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentEnum.PRICING).subscribe((settings) => {
        // Get the currency
        if (settings && settings.count > 0 && settings.result[0].content) {
          const config = settings.result[0].content;
          // ID
          pricingSettings.id = settings.result[0].id;
          pricingSettings.sensitiveData = settings.result[0].sensitiveData;
          // Simple price
          if (config.simple) {
            pricingSettings.type = PricingSettingsType.simple;
            pricingSettings.simple = {
              price: config.simple.price ? parseFloat(config.simple.price) : 0,
              currency: config.simple.currency ? config.simple.currency : ''
            };
          }
          // Convergeant Charging
          if (config.convergentCharging) {
            pricingSettings.type = PricingSettingsType.convergentCharging;
            pricingSettings.convergentCharging = {
              url: config.convergentCharging.url ? config.convergentCharging.url : '',
              chargeableItemName: config.convergentCharging.chargeableItemName ? config.convergentCharging.chargeableItemName : '',
              user: config.convergentCharging.user ? config.convergentCharging.user : '',
              password: config.convergentCharging.password ? config.convergentCharging.password : ''
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
      'id': settings.id,
      'identifier': ComponentEnum.PRICING,
      'sensitiveData': [],
      'content': JSON.parse(JSON.stringify(settings))
    };
    if (settings.type === PricingSettingsType.convergentCharging) {
      settingsToSave.sensitiveData = ['content.convergentCharging.password'];
    }
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
      settings.type = RefundSettingsType.concur;
    }
    // build setting payload
    const settingsToSave = {
      'id': settings.id,
      'identifier': ComponentEnum.REFUND,
      'sensitiveData': [],
      'content': JSON.parse(JSON.stringify(settings))
    };
    if (settings.type === RefundSettingsType.concur) {
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
      'id': settings.id,
      'identifier': ComponentEnum.OCPI,
      'sensitiveData': [],
      'content': JSON.parse(JSON.stringify(settings))
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
      'id': settings.id,
      'identifier': ComponentEnum.ANALYTICS,
      'sensitiveData': [],
      'content': JSON.parse(JSON.stringify(settings))
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public getOcpiSettings(): Observable<OcpiSettings> {
    return new Observable((observer) => {
      const ocpiSettings = {
        identifier: ComponentEnum.OCPI
      } as OcpiSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentEnum.OCPI).subscribe((settings) => {
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
        identifier: ComponentEnum.ANALYTICS
      } as AnalyticsSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentEnum.ANALYTICS, contentFilter).subscribe((settings) => {
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
        identifier: ComponentEnum.REFUND
      } as RefundSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentEnum.REFUND).subscribe((settings) => {
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
}
