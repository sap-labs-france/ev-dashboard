import { Injectable } from '@angular/core';
import { CentralServerService } from './central-server.service';
import { Company } from 'app/common.types';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

const DATA_LOAD_INTERVAL = 10000;

export interface SiteCurrentMetrics {
  name: string;
  id: string;
  companyID: string;
  company: Company;
  currentConsumption: number;
  totalConsumption: number;
  currentTotalInactivitySecs: number;
  maximumPower: number;
  maximumNumberOfChargingPoint: number;
  occupiedChargingPoint: number;
  address: any;
  image: any;
  trends: any;
  dataConsumptionChart: any;
  dataDeliveredChart: any;
}

@Injectable()
export class DashboardService {
  currentMetrics: SiteCurrentMetrics[] = [];
  initialLoadDone = new BehaviorSubject<boolean>(false);
  /*  sites = {};
    sites0 = [{
      name: 'Overall', consumption: 500, activeChargers: 20,
      latitude: 43.612306, longitude: 7.016928, consumptionValue: 450
    }]
    sites1 = [{
      name: 'Site 1', consumption: 100, activeChargers: 4,
      latitude: 43.612306, longitude: 7.016928, consumptionValue: 200, logoUrl: 'assets/img/card-3.jpeg'
    },
    {
      name: 'Site 2', consumption: 110, activeChargers: 5,
      latitude: 43.612306, longitude: 7.016928, consumptionValue: 250, logoUrl: 'assets/img/card-2.jpeg'
    }]
    sites2 = [{
      name: 'Site A', active: true, consumption: 50, activeChargers: 6,
      latitude: 43.612306, longitude: 7.016928, consumptionValue: 300, logoUrl: 'assets/img/card-1.jpeg'
    },
    { name: 'Site B', consumption: 60, activeChargers: 7, latitude: 43.612306, longitude: 7.016928, consumptionValue: 230 },
    { name: 'Site C', consumption: 70, activeChargers: 8, latitude: 43.612306, longitude: 7.016928, consumptionValue: 321 }]
    companys = [{ name: 'All', logoUrl: 'assets/img/bg3.jpg', sites: this.sites0 },
    { name: 'Company 1', logoUrl: 'assets/img/logo-low.png', sites: this.sites1 },
    { name: 'Company 2', logoUrl: 'assets/img/angular2-logo.png', sites: this.sites2 }];
  */
  constructor(private centralServerService: CentralServerService) {
    //    this.dummyData();
    // First load
    this.loadData();
    setInterval(() => {
      this.loadData();
    }, DATA_LOAD_INTERVAL);
  }

  loadData() {
    this.centralServerService.getCurrentMetrics().subscribe((statistics) => {
      this.currentMetrics = statistics;
      this.dummyData();
      if (this.initialLoadDone.getValue() === false) {
        this.initialLoadDone.next(true);
      }
    }, (error) => {
    });
  }

  dummyData() {
    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */
    for (const site of this.currentMetrics) {
      if (!site.dataConsumptionChart) {
        site.dataConsumptionChart = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
            [Math.round(Math.random() * 230), Math.round(Math.random() * 750), Math.round(Math.random() * 450), 300, 280, 240, 200, 190]
          ]
        };
      }
      if (!site.dataDeliveredChart) {
        site.dataDeliveredChart = {
          labels: ['12p', '3p', '6p', '9p', '12p', '3a', '6a', '9a'],
          series: [
            [Math.round(Math.random() * 230), Math.round(Math.random() * 750), Math.round(Math.random() * 450), 300, 280, 240, 200, 190]
          ]
        };
      }
    }
  }

  getStatistics(period: string, metrics: SiteCurrentMetrics): SiteCurrentMetrics {
    const currentData = this.currentMetrics.find((metric) => metric.id === metrics.id);
    const graphLabels = [];
    let graphSerie = [];
    let date = moment();
    switch (period) {
      case 'day':
        // create a date/time for each hour
        date = moment().startOf('day');
        do {
          graphLabels.push(date.format('h:mm'));
          date.add(1, 'hour');
        } while (date < moment())
//        graphLabels.push(moment().format('h:mm'));
        graphSerie = this.generateDummyData(graphLabels.length, 450);
        while (graphLabels.length < 24) {
          graphLabels.push(date.format('h:mm'));
          date.add(1, 'hour');
        }
        break;
      case 'week':
        // create a date/time for 6 hours
        date = moment().startOf('week');
        do {
          graphLabels.push(date.format('ddd'));
          date.add(1, 'day');
        } while (date < moment())
//        graphLabels.push(moment().format('ddd, h:mmm'));
        graphSerie = this.generateDummyData(graphLabels.length, 450);
        while (graphLabels.length < 7) {
          graphLabels.push(date.format('ddd'));
          date.add(1, 'day');
        }
        break;
      case 'month':
        // create a date/time for every day
        date = moment().startOf('month');
        do {
          graphLabels.push(date.format('Do'));
          date.add(1, 'day');
        } while (date < moment())
//        graphLabels.push(moment().format('ddd, Do'));
        graphSerie = this.generateDummyData(graphLabels.length, 450);
        while (graphLabels.length < moment().endOf('month').date()) {
          graphLabels.push(date.format('Do'));
          date.add(1, 'day');
        }
        break;
      case 'year':
        // create a date/time for every day
        date = moment().startOf('year');
        do {
          graphLabels.push(date.format('MMM'));
          date.add(1, 'month');
        } while (date < moment());
//        graphLabels.push(moment().format('MMM'));
        graphSerie = this.generateDummyData(graphLabels.length, 450);
        while (graphLabels.length < 12) {
          graphLabels.push(date.format('MMM'));
          date.add(1, 'day');
        }
        break;
      default:
        break;
    }
    currentData.dataDeliveredChart = {
      labels: graphLabels,
      series: [graphSerie]
    }
    return currentData;
  }

  getRealtime(type: string, metrics: SiteCurrentMetrics): SiteCurrentMetrics {
    const currentData = this.currentMetrics.find((metric) => metric.id === metrics.id);
    const graphLabels = [];
    let graphSerie = [];
    let date = moment();
    switch (type) {
      case 'consumption':
        // create a date/time for each 5 minutes
        date = moment().startOf('day');
        do {
          graphLabels.push(date.format('h:mm'));
          date.add(5, 'minutes');
        } while (date < moment())
        graphSerie = this.generateDummyData(graphLabels.length, metrics.maximumPower / 1000, 10);
        break;
      case 'utilization':
        // create a date/time for each 5 minutes
        date = moment().startOf('day');
        do {
          graphLabels.push(date.format('h:mm'));
          date.add(5, 'minutes');
        } while (date < moment())
        graphSerie = this.generateDummyData(graphLabels.length, metrics.maximumNumberOfChargingPoint, 2);
        break;
      default:
        break;
    }
    currentData.dataConsumptionChart = {
      labels: graphLabels,
      series: [graphSerie]
    }
    return currentData;
  }

  generateDummyData(numberOfData, maxValue, maxVariation: number = 0): any[] {
    const data = [];
    for (let index = 0; index < numberOfData; index++) {
      if (maxVariation > 0 && index > 0) {
        let value = (Math.round(Math.random() * maxVariation));
        value = (Math.random() > 0.5 ? value : value * -1);
        data.push(data[index - 1] + value > maxValue ? maxValue : ( data[index - 1] + value < 0 ? 0 : data[index - 1] + value))
      } else {
        data.push(Math.round(Math.random() * maxValue))
      }
    }
    return data;
  }
}
