import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constants } from 'utils/Constants';

import { ActionResponse, BillingAccountDataResult, Ordering, Paging } from '../types/DataResult';
import {
  AnalyticsSettings,
  AssetConnectionType,
  AssetSettings,
  AssetSettingsType,
  BillingSettings,
  BillingSettingsType,
  CarConnectorConnectionType,
  CarConnectorSettings,
  CarConnectorSettingsType,
  CryptoSettings,
  PricingSettings,
  PricingSettingsType,
  RefundSettings,
  RefundSettingsType,
  RoamingSettings,
  SettingDB,
  SmartChargingSettings,
  SmartChargingSettingsType,
  TechnicalSettings,
  UserSettings,
  UserSettingsType,
} from '../types/Setting';
import { TenantComponents } from '../types/Tenant';
import { Utils } from '../utils/Utils';
import { CentralServerService } from './central-server.service';

@Injectable()
export class ComponentService {
  private activeComponents!: string[] | null;

  public constructor(private centralServerService: CentralServerService) {
    this.centralServerService.getCurrentUserSubject().subscribe((user) => {
      if (user && user.activeComponents) {
        this.activeComponents = user.activeComponents;
      } else {
        this.activeComponents = null;
      }
    });
  }

  public isActive(componentName: TenantComponents): boolean {
    if (this.activeComponents) {
      return this.activeComponents.includes(componentName);
    }
    return false;
  }

  public getActiveComponents(): string[] | null {
    return this.activeComponents;
  }

  public getPricingSettings(): Observable<PricingSettings> {
    return new Observable((observer) => {
      let pricingSettings = {
        identifier: TenantComponents.PRICING,
      } as PricingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.PRICING).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            pricingSettings = settings as PricingSettings;
            // Set specific setting data
            const config = settings.content;
            // Simple price
            if (config.simple) {
              pricingSettings.type = PricingSettingsType.SIMPLE;
              pricingSettings.simple = {
                price: config.simple.price ? Utils.convertToFloat(config.simple.price) : 0,
                currency: config.simple.currency ? config.simple.currency : '',
              };
            }
          }
          observer.next(pricingSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public savePricingSettings(settings: PricingSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.PRICING,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
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
    // Save
    return this.centralServerService.updateBillingSettings(settings);
  }

  public saveRefundSettings(settings: RefundSettings): Observable<ActionResponse> {
    // Check the type
    if (!settings.type) {
      settings.type = RefundSettingsType.CONCUR;
    }
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.REFUND,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    if (settings.type === RefundSettingsType.CONCUR) {
      settingsToSave.sensitiveData = ['content.concur.clientSecret'];
    }
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveOcpiSettings(settings: RoamingSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.OCPI,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveOicpSettings(settings: RoamingSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.OICP,
      content: Utils.cloneObject(settings),
      sensitiveData: [
        'content.oicp.cpo.key',
        'content.oicp.cpo.cert',
        'content.oicp.emsp.key',
        'content.oicp.emsp.cert',
      ],
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveAssetConnectionSettings(settings: AssetSettings): Observable<ActionResponse> {
    // Check the type
    if (!settings.type) {
      settings.type = AssetSettingsType.ASSET;
    }
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.ASSET,
      sensitiveData: [],
      content: Utils.cloneObject(settings) as AssetSettings,
    };
    settingsToSave.content.asset.connections.forEach((settingConnection, index) => {
      switch (settingConnection.type) {
        case AssetConnectionType.SCHNEIDER:
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].schneiderConnection.password`
          );
          break;
        case AssetConnectionType.GREENCOM:
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].greencomConnection.clientSecret`
          );
          break;
        case AssetConnectionType.IOTHINK:
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].iothinkConnection.password`
          );
          break;
        case AssetConnectionType.WIT:
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].witConnection.password`
          );
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].witConnection.clientSecret`
          );
          break;
        case AssetConnectionType.LACROIX:
          settingsToSave.sensitiveData.push(
            `content.asset.connections[${index}].lacroixConnection.password`
          );
          break;
      }
    });
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveCarConnectorConnectionSettings(
    settings: CarConnectorSettings
  ): Observable<ActionResponse> {
    // Check the type
    if (!settings.type) {
      settings.type = CarConnectorSettingsType.CAR_CONNECTOR;
    }
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.CAR_CONNECTOR,
      sensitiveData: [],
      content: Utils.cloneObject(settings) as CarConnectorSettings,
    };
    settingsToSave.content.carConnector.connections.forEach((settingConnection, index) => {
      switch (settingConnection.type) {
        case CarConnectorConnectionType.MERCEDES:
          settingsToSave.sensitiveData.push(
            `content.carConnector.connections[${index}].mercedesConnection.clientSecret`
          );
          break;
        case CarConnectorConnectionType.TRONITY:
          settingsToSave.sensitiveData.push(
            `content.carConnector.connections[${index}].tronityConnection.clientSecret`
          );
          break;
        case CarConnectorConnectionType.TARGA_TELEMATICS:
          settingsToSave.sensitiveData.push(
            `content.carConnector.connections[${index}].targaTelematicsConnection.clientSecret`
          );
          break;
      }
    });
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveSacSettings(settings: AnalyticsSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.ANALYTICS,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    // Save
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public saveSmartChargingSettings(settings: SmartChargingSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.SMART_CHARGING,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    if (settings.type === SmartChargingSettingsType.SAP_SMART_CHARGING) {
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
      // Get the Billing settings
      this.centralServerService.getBillingSettings().subscribe({
        next: (billingSettings) => {
          observer.next(billingSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getBillingAccounts(
    paging: Paging = Constants.DEFAULT_PAGING,
    ordering: Ordering[] = []
  ): Observable<BillingAccountDataResult> {
    return new Observable((observer) => {
      this.centralServerService.getBillingAccounts(paging, ordering).subscribe({
        next: (accounts) => {
          observer.next(accounts);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getOcpiSettings(): Observable<RoamingSettings> {
    return new Observable((observer) => {
      let ocpiSettings = {
        identifier: TenantComponents.OCPI,
      } as RoamingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.OCPI).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            ocpiSettings = settings as RoamingSettings;
            // Set specific setting data
            const config = settings.content;
            ocpiSettings.ocpi = config.ocpi;
          }
          observer.next(ocpiSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getOicpSettings(): Observable<RoamingSettings> {
    return new Observable((observer) => {
      const oicpSettings = {
        identifier: TenantComponents.OICP,
      } as RoamingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.OICP).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            const config = settings.content;
            // Set
            oicpSettings.id = settings.id;
            oicpSettings.sensitiveData = settings.sensitiveData;
            oicpSettings.oicp = config.oicp;
          }
          observer.next(oicpSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getSacSettings(): Observable<AnalyticsSettings> {
    return new Observable((observer) => {
      let analyticsSettings = {
        identifier: TenantComponents.ANALYTICS,
      } as AnalyticsSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.ANALYTICS).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            analyticsSettings = settings as AnalyticsSettings;
            // Set specific setting data
            const config = settings.content;
            analyticsSettings.sac = config.sac;
            analyticsSettings.links = config.links;
          }
          observer.next(analyticsSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getRefundSettings(): Observable<RefundSettings> {
    return new Observable((observer) => {
      let refundSettings = {
        identifier: TenantComponents.REFUND,
      } as RefundSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.REFUND).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            refundSettings = settings as RefundSettings;
            // Set specific setting data
            const config = settings.content;
            refundSettings.concur = config.concur;
          }
          observer.next(refundSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getSmartChargingSettings(): Observable<SmartChargingSettings> {
    return new Observable((observer) => {
      let smartChargingSettings = {
        identifier: TenantComponents.SMART_CHARGING,
      } as SmartChargingSettings;
      // Get the SmartCharging settings
      this.centralServerService.getSetting(TenantComponents.SMART_CHARGING).subscribe({
        next: (settings) => {
          if (settings) {
            // Init
            smartChargingSettings = settings as SmartChargingSettings;
            // Set specific setting data
            const config = settings.content;
            smartChargingSettings.sapSmartCharging = config.sapSmartCharging;
          }
          observer.next(smartChargingSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getAssetSettings(): Observable<AssetSettings> {
    return new Observable((observer) => {
      let assetSettings = {
        identifier: TenantComponents.ASSET,
      } as AssetSettings;
      // Get the Asset settings
      this.centralServerService.getSetting(TenantComponents.ASSET).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            assetSettings = settings as AssetSettings;
            // Set specific setting data
            const config = settings.content;
            assetSettings.asset = config.asset;
          }
          observer.next(assetSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getCarConnectorSettings(): Observable<CarConnectorSettings> {
    return new Observable((observer) => {
      let carConnectorsSettings = {
        identifier: TenantComponents.CAR_CONNECTOR,
      } as CarConnectorSettings;
      // Get the Car Connector settings
      this.centralServerService.getSetting(TenantComponents.CAR_CONNECTOR).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            carConnectorsSettings = settings as CarConnectorSettings;
            // Set specific setting data
            const config = settings.content;
            carConnectorsSettings.carConnector = config.carConnector;
          }
          observer.next(carConnectorsSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getCryptoSettings(): Observable<CryptoSettings> {
    return new Observable((observer) => {
      let cryptoSettings = {
        identifier: TechnicalSettings.CRYPTO,
      } as CryptoSettings;
      // Get the Asset settings
      this.centralServerService.getSetting(TechnicalSettings.CRYPTO).subscribe({
        next: (settings) => {
          // Get the currency
          if (settings) {
            // Init
            cryptoSettings = settings as CryptoSettings;
            // Set specific setting data
            const config = settings.content;
            cryptoSettings.crypto = {
              key: config.crypto.key,
              keyProperties: config.crypto.keyProperties,
              migrationToBeDone: config.crypto.migrationToBeDone,
            };
          }
          observer.next(cryptoSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public saveCryptoSettings(settings: CryptoSettings): Observable<ActionResponse> {
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TechnicalSettings.CRYPTO,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    return this.centralServerService.updateSetting(settingsToSave);
  }

  public getUserSettings(): Observable<UserSettings> {
    return new Observable((observer) => {
      let userSettings = {
        identifier: TechnicalSettings.USER,
      } as UserSettings;
      // Get the user settings
      this.centralServerService.getSetting(TechnicalSettings.USER).subscribe({
        next: (settings) => {
          // Get the needed settings for update
          if (settings) {
            // Init
            userSettings = settings as UserSettings;
            // Set specific setting data
            const config = settings.content;
            userSettings.type = config.type as UserSettingsType;
            userSettings.user = config.user;
          }
          observer.next(userSettings);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public saveUserSettings(settings: UserSettings): Observable<ActionResponse> {
    // build settings to proceed update
    const settingsToSave = {
      id: settings.id,
      identifier: settings.identifier,
      content: Utils.cloneObject(settings),
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    return this.centralServerService.updateSetting(settingsToSave);
  }
}
