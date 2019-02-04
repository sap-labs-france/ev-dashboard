import { Injectable } from '@angular/core';

@Injectable()
export class DashboardService {
  sites = {};
  sites0 = [{ name: 'Overall', consumption: 500, activeChargers: 20,
    latitude: 43.612306, longitude: 7.016928, consumptionValue: 450  }]
  sites1 = [{ name: 'Site 1', consumption: 100, activeChargers: 4,
    latitude: 43.612306, longitude: 7.016928, consumptionValue: 200, logoUrl: 'assets/img/card-3.jpeg' },
  { name: 'Site 2', consumption: 110, activeChargers: 5,
     latitude: 43.612306, longitude: 7.016928, consumptionValue: 250, logoUrl: 'assets/img/card-2.jpeg' }]
  sites2 = [{ name: 'Site A', active: true, consumption: 50, activeChargers: 6,
     latitude: 43.612306, longitude: 7.016928, consumptionValue: 300, logoUrl: 'assets/img/card-1.jpeg' },
  { name: 'Site B', consumption: 60, activeChargers: 7, latitude: 43.612306, longitude: 7.016928, consumptionValue: 230 },
  { name: 'Site C', consumption: 70, activeChargers: 8, latitude: 43.612306, longitude: 7.016928, consumptionValue: 321 }]
  companys = [{ name: 'All', logoUrl: 'assets/img/bg3.jpg', sites: this.sites0 },
  { name: 'Company 1', logoUrl: 'assets/img/logo-low.png', sites: this.sites1 },
  { name: 'Company 2', logoUrl: 'assets/img/angular2-logo.png', sites: this.sites2 }];
  constructor() {
    this.dummyData();
    setInterval(() => {
      this.companys.forEach((company) => {
        company.sites.forEach((site) => {
          site.consumptionValue = Math.round(Math.random() * 500);
          site.activeChargers = Math.round(Math.random() * 24);
          site.consumption += Math.round(Math.random() * 5)
          this.dummyData();
        });
      });
    }, 5000);
  }
  dummyData() {
    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */

    for (const company of this.companys) {
      for (const site of company.sites) {
        site['dataConsumptionChart'] = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
            [Math.round(Math.random() * 230), Math.round(Math.random() * 750), Math.round(Math.random() * 450), 300, 280, 240, 200, 190]
          ]
        };
        site['dataDeliveredChart'] = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
            [Math.round(Math.random() * 230), Math.round(Math.random() * 750), Math.round(Math.random() * 450), 300, 280, 240, 200, 190]
          ]
        };
      }
    }
  }
}
