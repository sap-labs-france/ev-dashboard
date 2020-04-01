import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import AssetConfiguration from 'app/types/configuration/AssetConfiguration';
import CarConfiguration from 'app/types/configuration/CarConfiguration';
import AdvancedConfiguration from '../types/configuration/AdvancedConfiguration';
import AuthorizationConfiguration from '../types/configuration/AuthorizationConfiguration';
import CentralSystemServerConfiguration from '../types/configuration/CentralSystemServerConfiguration';
import CompanyConfiguration from '../types/configuration/CompanyConfiguration';
import { Configuration } from '../types/configuration/Configuration';
import FrontEndConfiguration from '../types/configuration/FrontEndConfiguration';
import LocalesConfiguration from '../types/configuration/LocalesConfiguration';
import SiteAreaConfiguration from '../types/configuration/SiteAreaConfiguration';
import SiteConfiguration from '../types/configuration/SiteConfiguration';
import UserConfiguration from '../types/configuration/UserConfiguration';

@Injectable()
export class ConfigService {
  private config!: Configuration;

  constructor(private http: HttpClient) {
    void this.load();
  }

  public async load() {
    this.config = await this.http.get<Configuration>('/assets/config.json').toPromise();
  }

  public getCentralSystemServer(): CentralSystemServerConfiguration {
    return this.config.CentralSystemServer;
  }

  public getFrontEnd(): FrontEndConfiguration {
    return (this.config.FrontEnd ? this.config.FrontEnd : {host: 'localhost'});
  }

  public getLocales(): LocalesConfiguration {
    return this.config.Locales;
  }

  public getAuthorization(): AuthorizationConfiguration {
    return this.config.Authorization;
  }

  public getAdvanced(): AdvancedConfiguration {
    return this.config.Advanced;
  }

  public getUser(): UserConfiguration {
    return this.config.User;
  }

  public getCompany(): CompanyConfiguration {
    return this.config.Company;
  }

  public getAsset(): AssetConfiguration {
    return this.config.Asset;
  }

  public getSite(): SiteConfiguration {
    return this.config.Site;
  }

  public getSiteArea(): SiteAreaConfiguration {
    return this.config.SiteArea;
  }

  public getCar(): CarConfiguration {
    return this.config.Car;
  }
}
