import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'app/services/message.service';
import { CurrentMetrics } from 'app/types/Statistic';
import { Utils } from 'app/utils/Utils';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { CentralServerService } from './central-server.service';

const DATA_LOAD_INTERVAL = 10000;

@Injectable()
export class DashboardService {
  currentMetrics: CurrentMetrics[] = [];
  initialLoadDone = new BehaviorSubject<boolean>(false);
  refreshData = new BehaviorSubject<CurrentMetrics[]>([]);
  intervalReference!: ReturnType<typeof setTimeout> | null;

  constructor(private centralServerService: CentralServerService,
              private messageService: MessageService,
              private router: Router) {
    // First load
    this.loadData();
    this.startLoading();
  }

  loadData() {
    this.centralServerService.getCurrentMetrics().subscribe((metrics) => {
      this.currentMetrics = metrics;
      if (this.initialLoadDone.getValue() === false) {
        this.initialLoadDone.next(true);
      } else {
        this.refreshData.next(this.currentMetrics);
      }
    }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    });
  }

  stopLoading() {
    if (this.intervalReference) {
      clearInterval(this.intervalReference);
      this.intervalReference = null;
    }
  }

  startLoading() {
    if (!this.intervalReference) {
      this.intervalReference = setInterval(() => {
        this.loadData();
      }, DATA_LOAD_INTERVAL);
    }
  }

  getStatistics(period: string, metrics: CurrentMetrics): CurrentMetrics | null {
    const currentData = this.currentMetrics.find((metric) => metric.id === metrics.id);
    if (!currentData) {
      return null;
    }
    const graphLabels = [];
    let graphSerie: any = [];
    // @ts-ignore
    let date = moment();
    switch (period) {
      case 'day':
        // create a date/time for each hour
        // @ts-ignore
        date = moment().startOf('day');
        do {
          graphLabels.push(date.format('h:mm'));
          date.add(1, 'hour');
        } while (date < moment());
        graphSerie = this.generateDummyData(graphLabels.length, 450);
        while (graphLabels.length < 24) {
          graphLabels.push(date.format('h:mm'));
          date.add(1, 'hour');
        }
        break;
      case 'week':
        // create a date/time for each day
        date = moment().startOf('week');
        do {
          graphLabels.push(date.format('ddd'));
          date.add(1, 'day');
        } while (date < moment());
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
        } while (date < moment());
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
      series: [graphSerie],
    };
    return currentData;
  }

  getRealtime(type: string, metrics: CurrentMetrics): CurrentMetrics {
    const currentData = this.currentMetrics.find((metric) => metric.id === metrics.id);
    if (!currentData) {
      return;
    }
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
        } while (date < moment());
        graphSerie = this.generateDummyData(graphLabels.length, metrics.maximumPower / 1000, 10);
        break;
      case 'utilization':
        // create a date/time for each 5 minutes
        date = moment().startOf('day');
        do {
          graphLabels.push(date.format('h:mm'));
          date.add(5, 'minutes');
        } while (date < moment());
        graphSerie = this.generateDummyData(graphLabels.length, metrics.maximumNumberOfChargingPoint, 2);
        break;
      default:
        break;
    }
    currentData.dataConsumptionChart = {
      labels: graphLabels,
      series: [graphSerie],
    };
    return currentData;
  }

  generateDummyData(numberOfData: number, maxValue: number, maxVariation: number = 0): number[] {
    const data: number[] = [];
    for (let index = 0; index < numberOfData; index++) {
      if (maxVariation > 0 && index > 0) {
        let value = (Math.round(Math.random() * maxVariation));
        value = (Math.random() > 0.5 ? value : value * -1);
        data.push(data[index - 1] + value > maxValue ? maxValue : (data[index - 1] + value < 0 ? 0 : data[index - 1] + value));
      } else {
        data.push(Math.round(Math.random() * maxValue));
      }
    }
    return data;
  }
}
