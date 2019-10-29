import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  private _config: object;

  constructor(
    private http: HttpClient) {
      this.load();
  }

  public load() {
    this.http.get('/assets/config.json').subscribe((data) => {
      this._config = data;
    });
  }

  public getCentralSystemServer() {
    return this._config['CentralSystemServer'];
  }

  public getFrontEnd() {
    return (this._config['FrontEnd'] ? this._config['FrontEnd'] : {host: 'localhost'});
  }

  public getLocales() {
    return this._config['Locales'];
  }

  public getAuthorization() {
    return this._config['Authorization'];
  }

  public getAdvanced() {
    return this._config['Advanced'];
  }

  public getUser() {
    return this._config['User'];
  }

  public getCompany() {
    return this._config['Company'];
  }

  public getVehicleManufacturer() {
    return this._config['VehicleManufacturer'];
  }

  public getVehicle() {
    return this._config['Vehicle'];
  }

  public getSite() {
    return this._config['Site'];
  }

  public getSiteArea() {
    return this._config['SiteArea'];
  }
}
