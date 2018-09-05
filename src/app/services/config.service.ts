import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class ConfigService {
  private _config: Object;

  constructor(
    private http: Http) {
  }

  load() {
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

  getCentralSystemServer() {
    return this._config['CentralSystemServer'];
  }

  getLocales() {
    return this._config['Locales'];
  }

  getAuthorization() {
    return this._config['Authorization'];
  }

  getAdvanced() {
    return this._config['Advanced'];
  }

  getUser() {
    return this._config['User'];
  }

  getCompany() {
    return this._config['Company'];
  }

  getVehicleManufacturer() {
    return this._config['VehicleManufacturer'];
  }

  getVehicle() {
    return this._config['Vehicle'];
  }

  getSite() {
    return this._config['Site'];
  }

  getSiteArea() {
    return this._config['SiteArea'];
  }
}
