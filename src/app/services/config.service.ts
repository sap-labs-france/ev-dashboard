import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import AssetConfiguration from 'app/types/configuration/AssetConfiguration';
import CarConfiguration from 'app/types/configuration/CarConfiguration';
import Debug from 'app/types/configuration/Debug';
import { Constants } from 'app/utils/Constants';

import AdvancedConfiguration from '../types/configuration/AdvancedConfiguration';
import AuthorizationConfiguration from '../types/configuration/AuthorizationConfiguration';
import CentralSystemServerConfiguration from '../types/configuration/CentralSystemServerConfiguration';
import CompanyConfiguration from '../types/configuration/CompanyConfiguration';
import { Configuration } from '../types/configuration/Configuration';
import FrontEndConfiguration from '../types/configuration/FrontEndConfiguration';
import LocalesConfiguration from '../types/configuration/LocalesConfiguration';
import SiteAreaConfiguration from '../types/configuration/SiteAreaConfiguration';
import SiteConfiguration from '../types/configuration/SiteConfiguration';
import TenantConfiguration from '../types/configuration/TenantConfiguration';
import UserConfiguration from '../types/configuration/UserConfiguration';

@Injectable()
export class ConfigService {
  private static config: Configuration;

  constructor(private http?: HttpClient) {
    this.load();
  }

  private getConfig(): Configuration {
    if (!ConfigService.config) {
      this.http.get<Configuration>('/assets/config.json').subscribe((configuration) => ConfigService.config = configuration);
    }
    return ConfigService.config;
  }

  public load() {
    this.getConfig();
  }

  public getCentralSystemServer(): CentralSystemServerConfiguration {
    if (typeof this.getConfig().CentralSystemServer.socketIOEnabled === 'undefined') {
      this.getConfig().CentralSystemServer.socketIOEnabled = true;
    }
    if (typeof this.getConfig().CentralSystemServer.connectionMaxRetries === 'undefined') {
      this.getConfig().CentralSystemServer.connectionMaxRetries = Constants.DEFAULT_MAX_BACKEND_CONNECTION_RETRIES;
    }
    if (typeof this.getConfig().CentralSystemServer.logoutOnConnectionError === 'undefined') {
      this.getConfig().CentralSystemServer.logoutOnConnectionError = true;
    }
    return this.getConfig().CentralSystemServer;
  }

  public getFrontEnd(): FrontEndConfiguration {
    return (this.getConfig().FrontEnd ? this.getConfig().FrontEnd : { host: 'localhost' });
  }

  public getLocales(): LocalesConfiguration {
    return this.getConfig().Locales;
  }

  public getAuthorization(): AuthorizationConfiguration {
    return this.getConfig().Authorization;
  }

  public getAdvanced(): AdvancedConfiguration {
    return this.getConfig().Advanced;
  }

  public getUser(): UserConfiguration {
    return this.getConfig().User;
  }

  public getCompany(): CompanyConfiguration {
    return this.getConfig().Company;
  }

  public getTenant(): TenantConfiguration {
    return this.config.Tenant;
  }

  public getAsset(): AssetConfiguration {
    return this.getConfig().Asset;
  }

  public getSite(): SiteConfiguration {
    return this.getConfig().Site;
  }

  public getSiteArea(): SiteAreaConfiguration {
    return this.getConfig().SiteArea;
  }

  public getCar(): CarConfiguration {
    return this.getConfig().Car;
  }

  public getDebug(): Debug {
    if (typeof this.getConfig().Debug === 'undefined') {
      this.getConfig().Debug = {} as Debug;
    }
    if (typeof this.getConfig().Debug.enabled === 'undefined') {
      this.getConfig().Debug.enabled = false;
    }
    return this.getConfig().Debug;
  }
}
