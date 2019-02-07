import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ConsumptionValue} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {DecimalPipe} from '@angular/common';
import {AppDatePipe} from '../../formatters/app-date.pipe';
import * as moment from 'moment';
import {ChartComponent} from 'angular2-chartjs';

@Component({
  selector: 'app-transaction-chart',
  styleUrls: ['consumption-chart.component.scss'],
  template: `
    <div #chart *ngIf="data && data.datasets && hasMoreThanTwoValues; else noData" class="chart-container">
      <div class="chart">
        <chart type="line"
               [data]="data"
               [options]="options"></chart>
      </div>
      <div class="icon-left">
        <a
          [class]="'btn btn-link btn-just-icon'"
          (click)="resetZoom()"><i class="material-icons">zoom_out_map</i></a>
      </div>
    </div>
    <ng-template #noData>
      {{'transactions.graph.no_consumption' | translate}}
    </ng-template>
  `
})


export class ConsumptionChartComponent implements OnInit {
  @Input() transactionId: number;
  @Input() consumptions: any[];
  hasMoreThanTwoValues = false;

  @Input() ratio: number;
  data: any;
  options: any;
  @ViewChild('chart') chartComponent: ChartComponent;
  private colors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
    [230, 126, 34],
    [211, 84, 0],
    [75, 192, 192],
    [151, 187, 205],
    [220, 220, 220],
    [247, 70, 74],
    [70, 191, 189],
    [148, 159, 177],
    [77, 83, 96]];
  private dataSetIndexes = [];

  constructor(private centralServerService: CentralServerService,
              private translateService: TranslateService,
              private localeService: LocaleService,
              private datePipe: AppDatePipe,
              private decimalPipe: DecimalPipe) {

  }

  resetZoom() {
    this.chartComponent.chart.resetZoom();
  }

  ngOnInit(): void {
    if (this.consumptions) {
      this.createGraphData(this.consumptions, false);
    } else {
      this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId)
        .subscribe(transaction => this.createGraphData(transaction.values, false));
    }
  }

  refresh() {
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId)
      .subscribe(transaction => this.createGraphData(transaction.values, true));
  }

  createGraphData(consumptions: any[], onRefresh: boolean) {
    this.hasMoreThanTwoValues = consumptions.length > 1;
    this.options = this.createOptions(consumptions);
    if (onRefresh) {
      this.options.animation = {duration: 0, easing: 'linear'};
    }
    let distanceBetween2points = Math.floor(consumptions.length / 200);
    // if (distanceBetween2points < 2) {
    distanceBetween2points = 1;
    // }
    const labels = [];
    const chargingPowerDataSet = {
      data: [],
      yAxisID: 'power',
      ...this.formatLineColor(this.colors[0]),
      label: this.translateService.instant('transactions.graph.power')
    };

    const cumulatedDataSet = {
      data: [],
      hidden: true,
      yAxisID: 'power',
      ...this.formatLineColor(this.colors[1]),
      label: this.translateService.instant('transactions.graph.energy')
    };

    const stateOfChargeDataSet = {
      data: [],
      yAxisID:
        'percentage',
      ...this.formatLineColor(this.colors[2]),
      label:
        this.translateService.instant('transactions.graph.battery')
    };

    const amountDataSet = {
      data: [],
      hidden: true,
      yAxisID: 'amount',
      ...this.formatLineColor(this.colors[3]),
      label: this.translateService.instant('transactions.graph.amount')
    };

    const cumulatedAmountDataSet = {
      data: [],
      hidden: true,
      yAxisID: 'amount',
      ...this.formatLineColor(this.colors[4]),
      label: this.translateService.instant('transactions.graph.cumulated_amount')
    };

    for (let i = 0; i < consumptions.length; i += distanceBetween2points) {
      const consumption = consumptions[i];
      labels.push(new Date(consumption.date).getTime());
      chargingPowerDataSet.data.push(consumption.value);
      cumulatedDataSet.data.push(consumption.cumulated);
      if (consumption.pricingSource) {
        amountDataSet.data.push(consumption.unroundedAmount);
        cumulatedAmountDataSet.data.push(consumption.cumulatedAmount);
      }
      if (consumption.stateOfCharge) {
        stateOfChargeDataSet.data.push(consumption.stateOfCharge);
      }
    }
    this.data = {
      labels: labels,
      datasets: [chargingPowerDataSet, cumulatedDataSet]
    };

    this.dataSetIndexes.push({name: 'consumption', colorIndex: 0});
    this.dataSetIndexes.push({name: 'cumulatedConsumption', colorIndex: 1});

    if (stateOfChargeDataSet.data.length > 0) {
      this.dataSetIndexes.push({name: 'stateOfCharge', colorIndex: 2});
      this.data.datasets.push(stateOfChargeDataSet);
      this.options.scales.yAxes.push({
        id: 'percentage',
        type: 'linear',
        position: 'right',
        ticks: {
          callback: (value, index, values) => `${value}%`
        }
      });
    }

    if (amountDataSet.data.length > 0) {
      this.dataSetIndexes.push({name: 'amount', colorIndex: 3});
      this.data.datasets.push(amountDataSet);
      this.options.scales.yAxes.push({
        id: 'amount',
        type: 'linear',
        position: 'right',
        ticks: {
          callback: (value, index, values) => `${value}€`,
          min: 0
        }
      });
    }

    if (cumulatedAmountDataSet.data.length > 0) {
      this.dataSetIndexes.push({name: 'cumulatedAmount', colorIndex: 4});
      this.data.datasets.push(cumulatedAmountDataSet);
      this.options.scales.yAxes.push({
        id: 'amount',
        type: 'linear',
        position: 'right',
        ticks: {
          callback: (value, index, values) => `${value}€`,
          min: 0
        }
      });
    }
  }

  createOptions(consumptions: ConsumptionValue[]) {
    const options: any = {
      legend: {position: 'bottom'},
      responsive: true,
      aspectRatio: this.ratio,
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
              backgroundColor: this.rgba(this.colors[this.dataSetIndexes[tooltipItem.datasetIndex].colorIndex], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (this.dataSetIndexes[tooltipItem.datasetIndex].name) {
              case 'consumption':
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
            }
          }
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value, index, values) => this.decimalPipe.transform(value / 1000)
            }
          }
        ]
      },
      pan: {
        enabled: true,
        mode: 'x',
        rangeMin: {
          x: consumptions.length > 0 ? new Date(consumptions[0].date).getTime() : 0,
        },
        rangeMax: {
          x: consumptions.length > 0 ? new Date(consumptions[consumptions.length - 1].date).getTime() : 0
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
      options.scales.xAxes[0].time = {
        tooltipFormat: 'HH:mm',
        displayFormats: {
          millisecond: 'HH:mm:ss.SSS',
          second: 'HH:mm:ss',
          minute: 'HH:mm',
          hour: 'HH'
        }
      };
    }
    return options;
  }

  formatLineColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 0.4),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff'
    };
  }

  rgba(colour: Array<number>, alpha: number): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
  }


}
