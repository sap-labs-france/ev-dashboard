import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigService {
  private _config: Object;

  constructor(
    private http: Http) {
  }

  public load() {
    // Get the Config
    return new Promise((resolve, reject) => {
      // Get the conf
      this.http.get('/assets/config.json')  // path of your config.json file
        .map(res => res.json())
        .subscribe(config => {
          // Store
          this._config = config;
          // End
          resolve(true);
        });
    });
  }

  public getCentralSystemServer() {
    return this._config['CentralSystemServer'];
  }

  public getFrontEnd() {
    return this._config['FrontEnd'];
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
