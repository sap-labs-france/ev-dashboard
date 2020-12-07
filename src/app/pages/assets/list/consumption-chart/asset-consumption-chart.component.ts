import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartColor, ChartData, ChartDataSets, ChartOptions, ChartTooltipItem } from 'chart.js';
import * as moment from 'moment';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { LocaleService } from '../../../../services/locale.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal-pipe';
import { AppDurationPipe } from '../../../../shared/formatters/app-duration.pipe';
import { AssetConsumption } from '../../../../types/Asset';
import { ConsumptionUnit } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-asset-chart',
  templateUrl: 'asset-consumption-chart.component.html',
})

export class AssetConsumptionChartComponent implements OnInit, AfterViewInit {
  @Input() public assetID!: string;
  @Input() public asset!: AssetConsumption;

  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;

  public selectedUnit = ConsumptionUnit.KILOWATT;
  public dateControl!: AbstractControl;
  public startDate = moment().startOf('d').toDate();
  public endDate = moment().endOf('d').toDate();

  private graphCreated = false;
  private lineTension = 0;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private options!: ChartOptions;
  private chart!: Chart;
  private instantPowerColor!: string;
  private limitColor!: string;
  private defaultColor!: string;
  private language!: string;
  private activeLegend = [
    {
      key: this.translateService.instant('transactions.graph.amps') + this.translateService.instant('asset.graph.power'),
      hidden: false
    },
    {
      key: this.translateService.instant('transactions.graph.limit_amps') + this.translateService.instant('asset.graph.limit_watts'),
      hidden: this.authorizationService.isAdmin() ? false : true
    },
  ];

  constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: AppDecimalPipe,
    private authorizationService: AuthorizationService ) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
  }

  public ngOnInit() {
    // Date control
    this.dateControl = new FormControl('dateControl',
      Validators.compose([
        Validators.required,
      ]));
    this.dateControl.setValue(this.startDate);
  }

  public ngAfterViewInit() {
    this.instantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
    this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
    this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.refresh();
    }
  }

  public refresh() {
    this.spinnerService.show();
    // Change Date for testing e.g.:
    this.centralServerService.getAssetConsumption(this.assetID, this.startDate, this.endDate)
      .subscribe((assetConsumption: AssetConsumption) => {
        this.spinnerService.hide();
        this.asset = assetConsumption;
        this.prepareOrUpdateGraph();
      }, (error) => {
        this.spinnerService.hide();
        delete this.asset;
      });
  }

  public unitChanged(key: ConsumptionUnit) {
    this.spinnerService.show();
    this.selectedUnit = key;
    this.createGraphData();
    this.prepareOrUpdateGraph();
    this.spinnerService.hide();
  }

  public dateFilterChanged(value: Date) {
    if (value) {
      this.startDate = moment(value).startOf('d').toDate();
      this.endDate = moment(value).endOf('d').toDate();
      this.refresh();
    }
  }

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (this.canDisplayGraph()) {
      if (!this.graphCreated) {
        this.graphCreated = true;
        this.options = this.createOptions();
        this.createGraphData();
        this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'), {
          type: 'bar',
          data: this.data,
          options: this.options,
        });
      }
      this.refreshDataSets();
      this.chart.update();
    }
  }

  private createGraphData() {
    if (this.data.datasets && this.options?.scales?.yAxes) {
      const datasets: ChartDataSets[] = [];
      // Instant Amps/Power
      datasets.push({
        name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'instantAmps' : 'instantWatts',
        type: 'line',
        hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps'))))].hidden,
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.amps' : 'asset.graph.power'),
      });
      // Limit Amps/Power
      datasets.push({
        name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'limitAmps' : 'limitWatts',
        type: 'line',
        hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.limit_amps'))))].hidden,
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.limit_amps' : 'asset.graph.limit_watts'),
      });
      this.options.scales.yAxes = [{
        id: 'power',
        ticks: {
          callback: (value: number) => (this.selectedUnit === ConsumptionUnit.AMPERE) ? value : value / 1000,
          min: 0,
        },
      }];
      // Assign
      this.data.labels = [];
      this.data.datasets = datasets;
    }
  }

  private getDataSet(name: string): number[] {
    if (this.data.datasets) {
      const dataSet = this.data.datasets.find((d) => (d as any).name === name);
      return dataSet ? dataSet.data as number[] : [];
    }
    return [];
  }

  private canDisplayGraph() {
    return this.asset && this.asset.values && this.asset.values.length > 1;
  }

  private refreshDataSets() {
    if (this.data.datasets) {
      for (const key of Object.keys(this.data.datasets)) {
        this.data.datasets[key].data = [];
      }
      const instantPowerDataSet = this.getDataSet('instantWatts');
      const instantAmpsDataSet = this.getDataSet('instantAmps');
      const limitWattsDataSet = this.getDataSet('limitWatts');
      const limitAmpsDataSet = this.getDataSet('limitAmps');
      const labels: number[] = [];
      // Add last point
      if (this.asset.values.length > 0) {
        this.asset.values.push({
          ...this.asset.values[this.asset.values.length - 1],
          startedAt: this.asset.values[this.asset.values.length - 1].endedAt,
        });
      }
      for (const consumption of this.asset.values) {
        labels.push(new Date(consumption.startedAt).getTime());
        if (instantPowerDataSet) {
          instantPowerDataSet.push(consumption.instantWatts);
        }
        if (instantAmpsDataSet) {
          instantAmpsDataSet.push(consumption.instantAmps);
        }
        if (limitWattsDataSet) {
          if (consumption.limitWatts) {
            limitWattsDataSet.push(consumption.limitWatts);
          } else {
            limitWattsDataSet.push(limitWattsDataSet.length > 0 ? limitWattsDataSet[limitWattsDataSet.length - 1] : 0);
          }
        }
        if (limitAmpsDataSet) {
          if (consumption.limitAmps) {
            limitAmpsDataSet.push(consumption.limitAmps);
          } else {
            limitAmpsDataSet.push(limitAmpsDataSet.length > 0 ? limitAmpsDataSet[limitAmpsDataSet.length - 1] : 0);
          }
        }
      }
      this.data.labels = labels;
    }
  }

  private createOptions(): ChartOptions {
    const locale = moment.localeData(this.language);
    const options: ChartOptions = {
      animation: {
        duration: 0,
      },
      legend: {
        position: 'bottom',
        labels: {
          fontColor: this.defaultColor,
        },
        onClick: (e, legendItem) => {
          const index = legendItem.datasetIndex;
          const ci = this.chart;
          const meta = ci.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(legendItem.text)))].hidden = meta.hidden;
          ci.update();
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        bodySpacing: 5,
        mode: 'index',
        position: 'nearest',
        multiKeyBackground: Utils.toRgba(this.instantPowerColor, 0.7),
        intersect: false,
        callbacks: {
          labelColor: (tooltipItem: ChartTooltipItem, chart: Chart) => {
            return {
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: this.data.datasets && tooltipItem.datasetIndex ?
                this.data.datasets[tooltipItem.datasetIndex].borderColor as ChartColor : '',
            };
          },
          label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
            if (this.data.datasets && data.datasets && !Utils.isUndefined(tooltipItem.datasetIndex)) {
              const dataSet = data.datasets[tooltipItem.datasetIndex];
              if (dataSet && dataSet.data && !Utils.isUndefined(tooltipItem.index)) {
                const value = dataSet.data[tooltipItem.index] as number;
                switch (this.data.datasets[tooltipItem.datasetIndex]['name']) {
                  case 'instantWatts':
                    return ' ' + this.decimalPipe.transform(value / 1000, '2.0-0') + 'kW';
                  case 'instantAmps':
                    return ' ' + this.decimalPipe.transform(value, '2.0-0') + 'A';
                  case 'limitWatts':
                    return ' ' + this.decimalPipe.transform(value / 1000, '2.0-0') + 'kW';
                  case 'limitAmps':
                    return ' ' + this.decimalPipe.transform(value, '2.0-0') + 'A';
                  default:
                    return value + '';
                }
              }
            }
            return '';
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            if (data.labels && data.labels.length > 0) {
              const firstDate = new Date(data.labels[0] as number);
              if (!Utils.isUndefined(item[0].index)) {
                const currentDate = new Date(data.labels[item[0].index] as number);
                return this.datePipe.transform(currentDate) + ' - ' +
                  this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000);
              }
            }
            return '';
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
            distribution: 'linear',
            time: {
              tooltipFormat: locale.longDateFormat('LT'),
              unit: 'minute',
              displayFormats: {
                second: locale.longDateFormat('LTS'),
                minute: locale.longDateFormat('LT'),
              },
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 40,
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
              beginAtZero: true,
              callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0')),
              fontColor: this.defaultColor,
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
        ],
      },
    };
    return options;
  }
}
