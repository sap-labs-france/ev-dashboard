import {Injectable} from '@angular/core';
import {CentralServerService} from './central-server.service';
import { PricingSettings, PricingSettingsType } from 'app/common.types';
import { Observable } from 'rxjs';

export enum ComponentEnum {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  PRICING = 'pricing',
  REFUND = 'refund',
  SAC = 'sac'
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
    } else {
      return false;
    }
  }

  public getActiveComponents(): string[] {
    return this.activeComponents;
  }

  public getPricingSettings(): Observable<PricingSettings> {
    return new Observable((observer) => {
      const pricingSettings = {} as PricingSettings;
      // Get the Pricing settings
      this.centralServerService.getSettings(ComponentEnum.PRICING).subscribe((setting) => {
        // Get the currency
        if (setting && setting.count > 0 && setting.result[0].content) {
          const config = setting.result[0].content;
          // Simple price
          if (config.simple) {
            pricingSettings.type = PricingSettingsType.simple;
            pricingSettings.simplePricing = {
              price: config.simple.price ? parseFloat(config.simple.price) : 0,
              currency: config.simple.currency ? config.simple.currency : ''
            }
          }
          // Convergeant Charging
          if (config.convergentCharging) {
            pricingSettings.type = PricingSettingsType.convergentCharging;
            pricingSettings.convergentCharging = {
              url: config.convergentCharging.url ? config.convergentCharging.url : '',
              chargeableItemName: config.convergentCharging.chargeableItemName ? config.convergentCharging.chargeableItemName : '',
              user: config.convergentCharging.user ? config.convergentCharging.user : '',
              password: config.convergentCharging.password ? config.convergentCharging.password : ''
            }
          }
        }
        observer.next(pricingSettings);
        observer.complete();
      });
    });
  }
}
