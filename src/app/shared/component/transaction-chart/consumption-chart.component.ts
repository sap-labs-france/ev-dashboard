import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CentralServerService} from '../../../services/central-server.service';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {DecimalPipe} from '@angular/common';
import {AppDatePipe} from '../../formatters/app-date.pipe';
import {Chart} from 'chart.js';
import {ConsumptionValue} from '../../../common.types';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { AppCurrencyPipe } from 'app/shared/formatters/app-currency.pipe';

@Component({
  selector: 'app-transaction-chart',
  templateUrl: 'consumption-chart.component.html'
})

export class ConsumptionChartComponent implements OnInit {
  @Input() transactionId: number;
  @Input() consumptions: ConsumptionValue[];
  @Input() ratio: number;
  @ViewChild('chart') ctx: ElementRef;

  private graphCreated = false;
  private currencyCode: string;
  private lineTension = 0;
  private data = {
    labels: [],
    datasets: [],
  };
  private options: any;
  private chart: any;
  // public ctx: any;
  private colors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [76, 186, 107],
    [63, 164, 91],
    [19, 164, 180],
    [82, 93, 244],
    [191, 57, 158],
    [108, 136, 147],
    [238, 104, 104],
    [47, 100, 151]];

  constructor(
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private localeService: LocaleService,
      private datePipe: AppDatePipe,
      private durationPipe: AppDurationPipe,
      private decimalPipe: DecimalPipe,
      private appCurrencyPipe: AppCurrencyPipe) {
  }

  ngOnInit(): void {
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.refresh();
    }
  }

  resetZoom() {
    this.chart.resetZoom();
  }

  refresh() {
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId)
      .subscribe(transaction => {
        this.consumptions = transaction.values;
        if (transaction.priceUnit) {
          this.currencyCode = transaction.priceUnit;
        }
        this.prepareOrUpdateGraph();
      });
  }


  prepareOrUpdateGraph() {
    if (this.canDisplayGraph()) {
      if (!this.graphCreated) {
        this.graphCreated = true;
        this.createOptions();
        this.createGraphData();
        this.chart = new Chart(this.ctx.nativeElement.getContext('2d'),
          {
            type: 'bar',
            data: this.data,
            options: this.options
          });
      }
      this.updatePanOptions();
      this.refreshDataSets();
      this.chart.update();
    }
  }

  createGraphData() {
    this.data.datasets.push({
      name: 'instantPower',
      colorIndex: 0,
      type: 'line',
      data: [],
      yAxisID: 'power',
      lineTension: this.lineTension,
      ...this.formatLineColor(this.colors[0]),
      label: this.translateService.instant('transactions.graph.power')
    });
    this.options.scales.yAxes.push({
      id: 'power',
      ticks: {
        callback: (value, index, values) => value / 1000.0,
        min: 0
      }
    });
    if (this.consumptions.find(c => c.stateOfCharge !== undefined)) {
      this.data.datasets.push({
        name: 'stateOfCharge',
        colorIndex: 2,
        type: 'line',
        data: [],
        yAxisID: 'percentage',
        lineTension: this.lineTension,
        ...this.formatLineColor(this.colors[2]),
        label:
          this.translateService.instant('transactions.graph.battery')
      });
      this.options.scales.yAxes.push(
        {
          id: 'percentage',
          type: 'linear',
          position: 'right',
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)'
          },
          ticks: {
            callback: (value, index, values) => `${value}%`,
            fontColor: '#0d47a1'
          }
        });
    }
    this.data.datasets.push({
      name: 'cumulatedConsumption',
      colorIndex: 1,
      type: 'line',
      data: [],
      hidden: true,
      yAxisID: 'power',
      lineTension: this.lineTension,
      ...this.formatLineColor(this.colors[1]),
      label: this.translateService.instant('transactions.graph.energy')
    });
    if (this.consumptions.find(c => c.hasOwnProperty('pricingSource')) !== undefined) {
      this.data.datasets.push({
        name: 'cumulatedAmount',
        colorIndex: 3,
        type: 'line',
        data: [],
        hidden: true,
        yAxisID: 'amount',
        lineTension: this.lineTension,
        ...this.formatLineColor(this.colors[3]),
        label: this.translateService.instant('transactions.graph.cumulated_amount')
      });
      this.options.scales.yAxes.push(
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)'
          },
          ticks: {
            callback: (value) => this.appCurrencyPipe.transform(value, this.currencyCode),
            min: 0,
            fontColor: '#fff'
          }
        });
    }
  }

  getDataSet(name) {
    return this.data.datasets.find(d => (d as any).name === name);
  }

  canDisplayGraph() {
    return this.consumptions && this.consumptions.length > 1;
  }

  refreshDataSets() {
    for (const key of Object.keys(this.data.datasets)) {
      this.data.datasets[key].data = [];
    }
    this.data.labels = [];
    for (let i = 0; i < this.consumptions.length; i += 1) {
      const consumption = this.consumptions[i];
      this.data.labels.push(new Date(consumption.date).getTime());
      this.getDataSet('instantPower').data.push(consumption.value);
      this.getDataSet('cumulatedConsumption').data.push(consumption.cumulated);
      if (this.getDataSet('cumulatedAmount')) {
        const dataSet = this.getDataSet('cumulatedAmount').data;
        if (consumption.cumulatedAmount !== undefined) {
          dataSet.push(consumption.cumulatedAmount);
        } else {
          dataSet.push(dataSet.length > 0 ? dataSet[dataSet.length - 1] : 0);
        }
      }
      if (this.getDataSet('stateOfCharge')) {
        const dataSet = this.getDataSet('stateOfCharge').data;
        if (consumption.stateOfCharge !== undefined) {
          dataSet.push(consumption.stateOfCharge);
        } else {
          dataSet.push(dataSet.length > 0 ? dataSet[dataSet.length - 1] : 0);
        }
      }
    }
  }

  createOptions() {
    this.options = {
      legend: {
        position: 'bottom',
        labels: {
          fontColor: '#0d47a1'
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      // aspectRatio: this.ratio,
      barPercentage: 0.5,
      tooltips: {
        bodySpacing: 5,
        mode: 'index',
        position: 'nearest',
        multiKeyBackground: 'rgba(0,0,0,0)',
        intersect: false,
        callbacks: {
          labelColor: (tooltipItem, chart) => {
            return {
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: this.rgba(this.colors[this.data.datasets[tooltipItem.datasetIndex].colorIndex], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (this.data.datasets[tooltipItem.datasetIndex].name) {
              case 'instantPower':
                return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kW';
              case 'cumulatedConsumption':
                return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kWh';
              case 'stateOfCharge':
                return ` ${value}%`;
              case 'amount':
                return this.appCurrencyPipe.transform(value, this.currencyCode);
              case 'cumulatedAmount':
                return this.appCurrencyPipe.transform(value, this.currencyCode);
              default:
                return value;
            }
          },
          title: (tooltipItems, data) => {
            const firstDate = data.labels[0];
            const currentDate = data.labels[tooltipItems[0].index];
            return this.datePipe.transform(currentDate) +
              ' - ' + this.durationPipe.transform((new Date(currentDate).getTime() - new Date(firstDate).getTime()) / 1000);
          }
        }
      },
      hover: {
        mode: 'index',
        intersect: false
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              tooltipFormat: 'h:mm a',
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)'
            },
            ticks: {
              fontColor: '#0d47a1'
            }
          }
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value, index, values) => this.decimalPipe.transform(value / 1000),
              fontColor: '#0d47a1'
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)'
            }
          }
        ]
      },
      pan: {
        enabled: true,
        mode: 'x',
        rangeMin: {
          x: 0,
        },
        rangeMax: {
          x: 0
        },
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 10
      }
    };
    if (this.localeService.language === 'fr') {
      this.options.scales.xAxes[0].time = {
        tooltipFormat: 'HH:mm',
        displayFormats: {
          millisecond: 'HH:mm:ss.SSS',
          second: 'HH:mm:ss',
          minute: 'HH:mm',
          hour: 'HH'
        }
      };
    }
  }

  updatePanOptions() {
    this.options.pan.rangeMin.x = this.consumptions.length > 0 ? new Date(this.consumptions[0].date).getTime() : 0;
    // tslint:disable-next-line:max-line-length
    this.options.pan.rangeMax.x = this.consumptions.length > 0 ? new Date(this.consumptions[this.consumptions.length - 1].date).getTime() : 0;
  }

  formatLineColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 0.2),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: this.rgba(colors, 0.8),
      hoverBorderColor: this.rgba(colors, 1)
    };
  }

  formatBarColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 1),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: this.rgba(colors, 0.8),
      hoverBorderColor: this.rgba(colors, 1)
    };
  }

  rgba(colour: Array<number>, alpha: number): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
  }
}
