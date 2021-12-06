import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ActionResponse } from '../types/DataResult';
import { AnalyticsSettings, AssetConnectionType, AssetSettings, AssetSettingsType, BillingSettings, BillingSettingsType, CarConnectorConnectionType, CarConnectorSetting, CarConnectorSettings, CarConnectorSettingsType, CryptoSettings, PricingSettings, PricingSettingsType, RefundSettings, RefundSettingsType, RoamingSettings, RoamingSettingsType, SmartChargingSettings, SmartChargingSettingsType, TechnicalSettings, UserSettings, UserSettingsType } from '../types/Setting';
import { TenantComponents } from '../types/Tenant';
import { Utils } from '../utils/Utils';
import { CentralServerService } from './central-server.service';

@Injectable()
export class ComponentService {
  private activeComponents!: string[]|null;

  public constructor(
    private centralServerService: CentralServerService) {
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

  public getActiveComponents(): string[]|null {
    return this.activeComponents;
  }

  public getPricingSettings(): Observable<PricingSettings> {
    return new Observable((observer) => {
      const pricingSettings = {
        identifier: TenantComponents.PRICING,
      } as PricingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.PRICING).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // ID
          pricingSettings.id = settings.id;
          pricingSettings.sensitiveData = settings.sensitiveData;
          // Simple price
          if (config.simple) {
            pricingSettings.type = PricingSettingsType.SIMPLE;
            pricingSettings.simple = {
              price: config.simple.price ? Utils.convertToFloat(config.simple.price) : 0,
              currency: config.simple.currency ? config.simple.currency : '',
            };
          }
          // Convergent Charging
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
    // Build setting payload
    const settingsToSave = {
      id: settings.id,
      identifier: TenantComponents.PRICING,
      sensitiveData: [],
      content: Utils.cloneObject(settings),
    };
    if (settings.type === PricingSettingsType.CONVERGENT_CHARGING) {
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
      sensitiveData: ['content.oicp.cpo.key', 'content.oicp.cpo.cert', 'content.oicp.emsp.key', 'content.oicp.emsp.cert']
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
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].schneiderConnection.password`);
          break;
        case AssetConnectionType.GREENCOM:
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].greencomConnection.clientSecret`);
          break;
        case AssetConnectionType.IOTHINK:
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].iothinkConnection.password`);
          break;
        case AssetConnectionType.WIT:
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].witConnection.password`);
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].witConnection.clientSecret`);
          break;
        case AssetConnectionType.LACROIX:
          settingsToSave.sensitiveData.push(`content.asset.connections[${index}].lacroixConnection.password`);
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

  public saveCarConnectorConnectionSettings(settings: CarConnectorSettings): Observable<ActionResponse> {
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
          settingsToSave.sensitiveData.push(`content.carConnector.connections[${index}].mercedesConnection.clientSecret`);
          break;
        case CarConnectorConnectionType.TRONITY:
          settingsToSave.sensitiveData.push(`content.carConnector.connections[${index}].tronityConnection.clientSecret`);
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
      this.centralServerService.getBillingSettings().subscribe((billingSettings) => {
        observer.next(billingSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getOcpiSettings(): Observable<RoamingSettings> {
    return new Observable((observer) => {
      const ocpiSettings = {
        identifier: TenantComponents.OCPI,
      } as RoamingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.OCPI).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // Set
          ocpiSettings.id = settings.id;
          ocpiSettings.sensitiveData = settings.sensitiveData;
          ocpiSettings.ocpi = config.ocpi;
        }
        observer.next(ocpiSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getOicpSettings(): Observable<RoamingSettings> {
    return new Observable((observer) => {
      const oicpSettings = {
        identifier: TenantComponents.OICP,
      } as RoamingSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.OICP).subscribe((settings) => {
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
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getSacSettings(): Observable<AnalyticsSettings> {
    return new Observable((observer) => {
      const analyticsSettings = {
        identifier: TenantComponents.ANALYTICS,
      } as AnalyticsSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.ANALYTICS).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // Set
          analyticsSettings.id = settings.id;
          analyticsSettings.sensitiveData = settings.sensitiveData;
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
        identifier: TenantComponents.REFUND,
      } as RefundSettings;
      // Get the Pricing settings
      this.centralServerService.getSetting(TenantComponents.REFUND).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // ID
          refundSettings.id = settings.id;
          // Sensitive data
          refundSettings.sensitiveData = settings.sensitiveData;
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

  public getSmartChargingSettings(): Observable<SmartChargingSettings> {
    return new Observable((observer) => {
      const smartChargingSettings = {
        identifier: TenantComponents.SMART_CHARGING,
      } as SmartChargingSettings;
      // Get the SmartCharging settings
      this.centralServerService.getSetting(TenantComponents.SMART_CHARGING).subscribe((settings) => {
        if (settings) {
          const config = settings.content;
          // Set
          smartChargingSettings.id = settings.id;
          smartChargingSettings.sensitiveData = settings.sensitiveData;
          smartChargingSettings.sapSmartCharging = config.sapSmartCharging;
        }
        observer.next(smartChargingSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getAssetSettings(): Observable<AssetSettings> {
    return new Observable((observer) => {
      const assetSettings = {
        identifier: TenantComponents.ASSET,
      } as AssetSettings;
      // Get the Asset settings
      this.centralServerService.getSetting(TenantComponents.ASSET).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // ID
          assetSettings.id = settings.id;
          // Sensitive data
          assetSettings.sensitiveData = settings.sensitiveData;
          // Set
          assetSettings.asset = config.asset;
        }
        observer.next(assetSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getCarConnectorSettings(): Observable<CarConnectorSettings> {
    return new Observable((observer) => {
      const carConnectorsSettings = {
        identifier: TenantComponents.CAR_CONNECTOR,
      } as CarConnectorSettings;
      // Get the Car Connector settings
      this.centralServerService.getSetting(TenantComponents.CAR_CONNECTOR).subscribe((settings) => {
        // Get the currency
        if (settings) {
          const config = settings.content;
          // ID
          carConnectorsSettings.id = settings.id;
          // Sensitive data
          carConnectorsSettings.sensitiveData = settings.sensitiveData;
          // Set
          carConnectorsSettings.carConnector = config.carConnector;
        }
        observer.next(carConnectorsSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public getCryptoSettings(): Observable<CryptoSettings> {
    return new Observable((observer) => {
      const cryptoSettings = {
        identifier: TechnicalSettings.CRYPTO,
      } as CryptoSettings;
      // Get the Asset settings
      this.centralServerService.getSetting(TechnicalSettings.CRYPTO).subscribe((settings) => {
        // Get the currency
        if (settings) {
          // ID
          cryptoSettings.id = settings.id;
          // Crypto Key
          cryptoSettings.crypto = {
            key: settings.content.crypto.key,
            keyProperties: settings.content.crypto.keyProperties,
            migrationToBeDone: settings.content.crypto.migrationToBeDone,
          };
        }
        observer.next(cryptoSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
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
      // Get the user settings
      this.centralServerService.getSetting(TechnicalSettings.USER).subscribe((settings) => {
        let userSettings: UserSettings;
        // Get the needed settings for update
        if (settings) {
          userSettings = {
            id: settings.id,
            identifier: TechnicalSettings.USER,
            type: settings.content.type as UserSettingsType,
            user: settings.content.user,
          };
        }
        observer.next(userSettings);
        observer.complete();
      }, (error) => {
        observer.error(error);
      });
    });
  }

  public saveUserSettings(settings: UserSettings): Observable<ActionResponse> {
    // build settings to proceed update
    const settingsToSave = {
      id: settings.id,
      identifier: settings.identifier,
      content: Utils.cloneObject(settings)
    };
    // Delete IDS
    delete settingsToSave.content.id;
    delete settingsToSave.content.identifier;
    delete settingsToSave.content.sensitiveData;
    return this.centralServerService.updateSetting(settingsToSave);
  }
}
