import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CentralServerService} from '../../../services/central-server.service';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {DecimalPipe} from '@angular/common';
import {AppDatePipe} from '../../formatters/app-date.pipe';
import * as moment from 'moment';
import {Chart} from 'chart.js';
import {ConsumptionValue} from '../../../common.types';

@Component({
  selector: 'app-transaction-chart',
  styleUrls: ['consumption-chart.component.scss'],
  templateUrl: 'consumption-chart.component.html'
})

export class ConsumptionChartComponent implements OnInit {
  @Input() transactionId: number;
  @Input() consumptions: ConsumptionValue[];
  graphCreated = false;
  @Input() ratio: number;
  @ViewChild('chart') ctx: ElementRef;
  data = {
    labels: [],
    datasets: [],
  };
  options: any;
  chart: any;
  // public ctx: any;
  private colors = [
    [116, 171, 226],
    [88, 153, 218],

    [25, 169, 121],

    [76, 186, 107],
    [63, 164, 91],
    [19, 164, 180],
    [82, 93, 244],
    [191, 57, 158],
    [108, 136, 147],
    [238, 104, 104],
    [47, 100, 151]];

  constructor(private centralServerService: CentralServerService,
              private translateService: TranslateService,
              private localeService: LocaleService,
              private datePipe: AppDatePipe,
              private decimalPipe: DecimalPipe) {
  }

  ngOnInit(): void {
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId)
        .subscribe(transaction => {
          this.consumptions = transaction.values;
          this.prepareOrUpdateGraph();
        });
    }
  }

  resetZoom() {
    this.chart.resetZoom();
  }

  refresh() {
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId)
      .subscribe(transaction => {
        this.consumptions = transaction.values;
        this.prepareOrUpdateGraph();
      });
  }


  prepareOrUpdateGraph() {
    console.log('prepareOrUpdateGraph');
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
      name: 'cumulatedConsumption',
      colorIndex: 1,
      type: 'line',
      data: [],
      hidden: true,
      yAxisID: 'power',
      ...this.formatLineColor(this.colors[1]),
      label: this.translateService.instant('transactions.graph.energy')
    });
    this.data.datasets.push({
      name: 'instantPower',
      colorIndex: 0,
      type: 'bar',
      data: [],
      yAxisID: 'power',
      ...this.formatBarColor(this.colors[0]),
      label: this.translateService.instant('transactions.graph.power')
    });
    if (this.consumptions.find(c => c.stateOfCharge !== undefined)) {
      this.data.datasets.push({
        name: 'stateOfCharge',
        colorIndex: 2,
        type: 'line',
        data: [],
        yAxisID: 'percentage',
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
            display: false
          },
          ticks: {
            callback: (value, index, values) => `${value}%`
          }
        });
    }
    if (this.consumptions.find(c => c.hasOwnProperty('pricingSource')) !== undefined) {
      this.data.datasets.push({
        name: 'cumulatedAmount',
        colorIndex: 3,
        type: 'line',
        data: [],
        hidden: true,
        yAxisID: 'amount',
        ...this.formatLineColor(this.colors[3]),
        label: this.translateService.instant('transactions.graph.cumulated_amount')
      });
      this.data.datasets.push({
        name: 'amount',
        colorIndex: 4,
        data: [],
        hidden: true,
        type: 'bar',
        yAxisID: 'amount',
        ...this.formatBarColor(this.colors[4]),
        label: this.translateService.instant('transactions.graph.amount')
      });
      this.options.scales.yAxes.push(
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          gridLines: {
            display: false
          },
          ticks: {
            callback: (value, index, values) => `${value}€`,
            min: 0
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
      this.data.labels = [];
    }
    for (let i = 0; i < this.consumptions.length; i += 1) {
      const consumption = this.consumptions[i];
      this.data.labels.push(new Date(consumption.date).getTime());
      this.getDataSet('instantPower').data.push(consumption.value);
      this.getDataSet('cumulatedConsumption').data.push(consumption.cumulated);
      if (consumption.pricingSource) {
        this.getDataSet('amount').data.push(consumption.unroundedAmount);
        this.getDataSet('cumulatedAmount').data.push(consumption.cumulatedAmount);
      }
      if (consumption.stateOfCharge) {
        this.getDataSet('stateOfCharge').data.push(consumption.stateOfCharge);
      }
    }
  }


  createOptions() {
    this.options = {
      legend: {
        position: 'bottom',
        labels: {
          fontColor: 'white'
        }
      },
      responsive: true,
      aspectRatio: this.ratio,
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
                return ` ${value}€`;
              case 'cumulatedAmount':
                return ` ${value}€`;
              default:
                return value;
            }
          },
          title: (tooltipItems, data) => {
            const firstDate = data.labels[0];
            const currentDate = data.labels[tooltipItems[0].index];

            return this.datePipe.transform(currentDate, this.localeService.getCurrentFullLocaleForJS(), 'time') +
              ' - ' + moment.duration(moment(currentDate).diff(firstDate)).format('h[h]mm[m]', {trim: false});
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
              color: 'rgba(255,255,255,0.5)'
            },
            ticks: {
              fontColor: 'white'
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
              fontColor: 'white'
            },
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.5)'
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
    this.options.pan.rangeMax.x = this.consumptions.length > 0 ? new Date(this.consumptions[this.consumptions.length - 1].date).getTime() : 0;
  }

  formatLineColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 0),
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
