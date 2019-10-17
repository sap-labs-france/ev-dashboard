import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppCurrencyPipe } from 'app/shared/formatters/app-currency.pipe';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { Chart } from 'chart.js';
import { Transaction } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { AppDatePipe } from '../../formatters/app-date.pipe';

@Component({
  selector: 'app-transaction-chart',
  templateUrl: 'consumption-chart.component.html',
})

export class ConsumptionChartComponent implements AfterViewInit {
  @Input() transactionId: number;
  @Input() transaction: Transaction;
  @Input() ratio: number;

  @ViewChild('primary', {static: true}) primaryElement: ElementRef;
  @ViewChild('accent', {static: true}) accentElement: ElementRef;
  @ViewChild('danger', {static: true}) dangerElement: ElementRef;
  @ViewChild('success', {static: true}) successElement: ElementRef;
  @ViewChild('chart', {static: true}) chartElement: ElementRef;

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

  constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: DecimalPipe,
    private appCurrencyPipe: AppCurrencyPipe) {
  }

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
      hoverBorderColor: ConsumptionChartComponent.toRgba(color, 1),
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
      hoverBorderColor: ConsumptionChartComponent.toRgba(color, 1),
    };
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
    this.centralServerService.getConsumptionFromTransaction(this.transactionId)
      .subscribe((transaction) => {
        this.transaction = transaction;
        this.prepareOrUpdateGraph();
      }, (error) => {
        this.transaction = null;
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
            options: this.options,
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
      label: this.translateService.instant('transactions.graph.power'),
    });
    this.options.scales.yAxes.push({
      id: 'power',
      ticks: {
        callback: (value) => value / 1000.0,
        min: 0,
      },
    });
    if (this.transaction.stateOfCharge || (this.transaction.stop && this.transaction.stop.stateOfCharge)) {
      this.data.datasets.push({
        name: 'stateOfCharge',
        type: 'line',
        data: [],
        yAxisID: 'percentage',
        lineTension: this.lineTension,
        ...ConsumptionChartComponent.formatLineColor(this.stateOfChargeColor),
        label:
          this.translateService.instant('transactions.graph.battery'),
      });
      this.options.scales.yAxes.push(
        {
          id: 'percentage',
          type: 'linear',
          position: 'right',
          display: 'auto',
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            callback: (value, index, values) => `${value}%`,
            fontColor: this.defaultColor,
          },
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
      label: this.translateService.instant('transactions.graph.energy'),
    });
    if (this.transaction.values.find((c) => c.hasOwnProperty('pricingSource')) !== undefined) {
      this.data.datasets.push({
        name: 'cumulatedAmount',
        type: 'line',
        data: [],
        hidden: true,
        yAxisID: 'amount',
        lineTension: this.lineTension,
        ...ConsumptionChartComponent.formatLineColor(this.amountColor),
        label: this.translateService.instant('transactions.graph.cumulated_amount'),
      });
      this.options.scales.yAxes.push(
        {
          id: 'amount',
          type: 'linear',
          position: 'right',
          display: 'auto',
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            callback: (value) => this.appCurrencyPipe.transform(value, this.currencyCode),
            min: 0,
            fontColor: this.defaultColor,
          },
        });
    }
  }

  getDataSet(name) {
    const dataSet = this.data.datasets.find((d) => (d as any).name === name);
    return dataSet ? dataSet.data : null;
  }

  canDisplayGraph() {
    return this.transaction && this.transaction.values && this.transaction.values.length > 1;
  }

  refreshDataSets() {
    for (const key of Object.keys(this.data.datasets)) {
      this.data.datasets[key].data = [];
    }
    this.data.labels = [];
    const instantPowerDataSet = this.getDataSet('instantPower');
    const cumulatedConsumptionDataSet = this.getDataSet('cumulatedConsumption');
    const cumulatedAmountDataSet = this.getDataSet('cumulatedAmount');
    const stateOfChargeDataSet = this.getDataSet('stateOfCharge');
    for (let i = 0; i < this.transaction.values.length; i += 1) {
      const consumption = this.transaction.values[i];
      this.data.labels.push(new Date(consumption.date).getTime());
      instantPowerDataSet.push(consumption.value);
      cumulatedConsumptionDataSet.push(consumption.cumulated);
      if (cumulatedAmountDataSet) {
        if (consumption.cumulatedAmount !== undefined) {
          cumulatedAmountDataSet.push(consumption.cumulatedAmount);
        } else {
          cumulatedAmountDataSet.push(cumulatedAmountDataSet.length > 0 ? cumulatedAmountDataSet[cumulatedAmountDataSet.length - 1] : 0);
        }

        if (consumption.currencyCode) {
          this.currencyCode = consumption.currencyCode;
        }
      }
      if (stateOfChargeDataSet) {
        if (consumption.stateOfCharge) {
          stateOfChargeDataSet.push(consumption.stateOfCharge);
        } else {
          stateOfChargeDataSet.push(stateOfChargeDataSet.length > 0 ?
            stateOfChargeDataSet[stateOfChargeDataSet.length - 1] : this.transaction.stateOfCharge);
        }
      }
    }
  }

  createOptions() {
    this.options = {
      legend: {
        position: 'bottom',
        labels: {
          fontColor: this.defaultColor,
        },
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
              backgroundColor: this.data.datasets[tooltipItem.datasetIndex].borderColor,
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
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
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
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              fontColor: this.defaultColor,
            },
          },
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value) => this.decimalPipe.transform(value / 1000),
              fontColor: this.defaultColor,
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
        ],
      },
      pan: {
        enabled: true,
        mode: 'x',
        rangeMin: {
          x: 0,
        },
        rangeMax: {
          x: 0,
        },
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 10,
      },
    };
    if (this.localeService.language === 'fr') {
      this.options.scales.xAxes[0].time = {
        tooltipFormat: 'HH:mm',
        displayFormats: {
          millisecond: 'HH:mm:ss.SSS',
          second: 'HH:mm:ss',
          minute: 'HH:mm',
          hour: 'HH',
        },
      };
    }
  }

  updatePanOptions() {
    this.options.pan.rangeMin.x =
      this.transaction.values.length > 0 ? new Date(this.transaction.values[0].date).getTime() : 0;
    // tslint:disable-next-line:max-line-length
    this.options.pan.rangeMax.x = this.transaction.values.length > 0 ? new Date(this.transaction.values[this.transaction.values.length - 1].date).getTime() : 0;
  }
}
