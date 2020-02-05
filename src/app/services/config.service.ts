import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Configuration } from '../types/configuration/Configuration';

@Injectable()
export class ConfigService {
  private config!: Configuration;

  constructor(private http: HttpClient) {
  }

  public async load() {
    this.config = await this.http.get<Configuration>('/assets/config.json').toPromise();
  }

  public getCentralSystemServer() {
    return this.config.CentralSystemServer;
  }

  public getFrontEnd() {
    return (this.config.FrontEnd ? this.config.FrontEnd : {host: 'localhost'});
  }

  public getLocales() {
    return this.config.Locales;
  }

  public getAuthorization() {
    return this.config.Authorization;
  }

  public getAdvanced() {
    return this.config.Advanced;
  }

  public getUser() {
    return this.config.User;
  }

  public getCompany() {
    return this.config.Company;
  }

  public getVehicleManufacturer() {
    return this.config.VehicleManufacturer;
  }

  public getVehicle() {
    return this.config.Vehicle;
  }

  public getSite() {
    return this.config.Site;
  }

  public getSiteArea() {
    return this.config.SiteArea;
  }
}
