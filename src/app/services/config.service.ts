import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { WINDOW } from 'providers/window.provider';
import { Observable, Observer } from 'rxjs';
import { Utils } from 'utils/Utils';

import AdvancedConfiguration from '../types/configuration/AdvancedConfiguration';
import AssetConfiguration from '../types/configuration/AssetConfiguration';
import AuthorizationConfiguration from '../types/configuration/AuthorizationConfiguration';
import CarConfiguration from '../types/configuration/CarConfiguration';
import CentralSystemServerConfiguration from '../types/configuration/CentralSystemServerConfiguration';
import CompanyConfiguration from '../types/configuration/CompanyConfiguration';
import { Configuration } from '../types/configuration/Configuration';
import Debug from '../types/configuration/Debug';
import Landscape, { LandscapeType } from '../types/configuration/Landscape';
import SiteAreaConfiguration from '../types/configuration/SiteAreaConfiguration';
import SiteConfiguration from '../types/configuration/SiteConfiguration';
import TenantConfiguration from '../types/configuration/TenantConfiguration';
import UserConfiguration from '../types/configuration/UserConfiguration';

@Injectable()
export class ConfigService {
  private config: Configuration;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private http: HttpClient, @Inject(WINDOW) private window: Window) {}

  public initConfig(): Observable<void> {
    return new Observable((observer: Observer<void>) => {
      this.http.get<Configuration>('/assets/config.json').subscribe({
        next: (config) => {
          this.config = config;
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  public getConfig(): Configuration {
    return this.config;
  }

  public getCentralSystemServer(): CentralSystemServerConfiguration {
    const centralSystemServer = this.getConfig().CentralSystemServer;
    if (!centralSystemServer.protocol) {
      centralSystemServer.protocol = this.window.location.protocol.slice(0, -1);
    }
    if (!centralSystemServer.host) {
      centralSystemServer.host = this.window.location.hostname;
    }
    if (!centralSystemServer.port) {
      centralSystemServer.port = Utils.convertToInteger(this.window.location.port);
    }
    return centralSystemServer;
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
    return this.getConfig().Tenant;
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
    if (this.isUndefined(this.getConfig().Debug)) {
      this.getConfig().Debug = {} as Debug;
    }
    if (this.isUndefined(this.getConfig().Debug.enabled)) {
      this.getConfig().Debug.enabled = false;
    }
    return this.getConfig().Debug;
  }

  public getLandscape(): Landscape {
    if (this.isUndefined(this.getConfig().Landscape)) {
      this.getConfig().Landscape = {} as Landscape;
    }
    if (this.isUndefined(this.getConfig().Landscape.type)) {
      this.getConfig().Landscape.type = LandscapeType.DEVELOPMENT;
    }
    return this.getConfig().Landscape;
  }

  private isUndefined(obj: any): boolean {
    return typeof obj === 'undefined';
  }
}
