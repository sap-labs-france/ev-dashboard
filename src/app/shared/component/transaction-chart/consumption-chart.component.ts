import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CentralServerService} from '../../../services/central-server.service';
import {TranslateService} from '@ngx-translate/core';
import {LocaleService} from '../../../services/locale.service';
import {DecimalPipe} from '@angular/common';
import {AppDatePipe} from '../../formatters/app-date.pipe';
import {Chart} from 'chart.js';
import {ConsumptionValue} from '../../../common.types';
import {AppDurationPipe} from 'app/shared/formatters/app-duration.pipe';
import {AppCurrencyPipe} from 'app/shared/formatters/app-currency.pipe';

@Component({
  selector: 'app-transaction-chart',
  templateUrl: 'consumption-chart.component.html'
})

export class ConsumptionChartComponent implements OnInit, AfterViewInit {
  @Input() transactionId: number;
  @Input() consumptions: ConsumptionValue[];
  @Input() ratio: number;

  @ViewChild('primary') primaryElement: ElementRef;
  @ViewChild('accent') accentElement: ElementRef;
  @ViewChild('danger') dangerElement: ElementRef;
  @ViewChild('success') successElement: ElementRef;
  @ViewChild('chart') chartElement: ElementRef;

  private graphCreated = false;
  private currencyCode: string;
  private lineTension = 0;
  private data = {
    labels: [],
    datasets: [],
  };
  private options: any;
  private chart: any;
  private consumptionColor: string;
  private instantPowerColor: string;
  private amountColor: string;
  private stateOfChargeColor: string;
  private defaultColor: string;

  static toRgba(rgb: string, alpha: number): string {
    if (!rgb) {
      return '';
    }
    let rgba = rgb.replace(/rgb/i, 'rgba');
    rgba = rgba.replace(/\)/i, `,${alpha})`);

    return rgba;
  }

  static formatBarColor(color: string): any {
    return {
      backgroundColor: ConsumptionChartComponent.toRgba(color, 1),
      borderColor: ConsumptionChartComponent.toRgba(color, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: ConsumptionChartComponent.toRgba(color, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: ConsumptionChartComponent.toRgba(color, 0.8),
      hoverBorderColor: ConsumptionChartComponent.toRgba(color, 1)
    };
  }

  static formatLineColor(color: string): any {
    return {
      backgroundColor: ConsumptionChartComponent.toRgba(color, 0.2),
      borderColor: ConsumptionChartComponent.toRgba(color, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: ConsumptionChartComponent.toRgba(color, 1),
      pointHoverBorderColor: '#fff',
      hoverBackgroundColor: ConsumptionChartComponent.toRgba(color, 0.8),
      hoverBorderColor: ConsumptionChartComponent.toRgba(color, 1)
    };
  }

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
  }

  ngAfterViewInit(): void {
    this.consumptionColor = getComputedStyle(this.accentElement.nativeElement).color;
    this.instantPowerColor = getComputedStyle(this.primaryElement.nativeElement).color;
    this.amountColor = getComputedStyle(this.dangerElement.nativeElement).color;
    this.stateOfChargeColor = getComputedStyle(this.successElement.nativeElement).color;
    this.defaultColor = getComputedStyle(this.chartElement.nativeElement).color;

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
        this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'),
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
      type: 'line',
      data: [],
      yAxisID: 'power',
      lineTension: this.lineTension,
      ...ConsumptionChartComponent.formatLineColor(this.instantPowerColor),
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
        type: 'line',
        data: [],
        yAxisID: 'percentage',
        lineTension: this.lineTension,
        ...ConsumptionChartComponent.formatLineColor(this.stateOfChargeColor),
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
            fontColor: this.defaultColor
          }
        });
    }
    this.data.datasets.push({
      name: 'cumulatedConsumption',
      type: 'line',
      data: [],
      hidden: true,
      yAxisID: 'power',
      lineTension: this.lineTension,
      ...ConsumptionChartComponent.formatLineColor(this.consumptionColor),
      label: this.translateService.instant('transactions.graph.energy')
    });
    if (this.consumptions.find(c => c.hasOwnProperty('pricingSource')) !== undefined) {
      this.data.datasets.push({
        name: 'cumulatedAmount',
        type: 'line',
        data: [],
        hidden: true,
        yAxisID: 'amount',
        lineTension: this.lineTension,
        ...ConsumptionChartComponent.formatLineColor(this.amountColor),
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
            fontColor: this.defaultColor
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
          fontColor: this.defaultColor
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
              backgroundColor: this.data.datasets[tooltipItem.datasetIndex].borderColor
            };
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
              fontColor: this.defaultColor
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
              fontColor: this.defaultColor
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
}
