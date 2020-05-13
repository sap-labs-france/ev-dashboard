import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { SiteArea, SiteAreaConsumption } from 'app/types/SiteArea';
import { ConsumptionUnit } from 'app/types/Transaction';
import { ChargingStations } from 'app/utils/ChargingStations';
import { Utils } from 'app/utils/Utils';
import { Chart, ChartColor, ChartData, ChartDataSets, ChartOptions, ChartTooltipItem } from 'chart.js';
import * as moment from 'moment';

import { CentralServerService } from '../../../../../services/central-server.service';
import { LocaleService } from '../../../../../services/locale.service';
import { AppDatePipe } from '../../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../../shared/formatters/app-decimal-pipe';

@Component({
  selector: 'app-site-area-chart',
  templateUrl: 'site-area-consumption-chart.component.html',
})

export class SiteAreaConsumptionChartComponent implements OnInit, AfterViewInit {
  @Input() public siteAreaId!: string;
  @Input() public siteAreaConsumption!: SiteAreaConsumption;

  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;

  public dateControl!: AbstractControl;
  public siteArea: SiteArea;

  public startDate = moment().startOf('d').toDate();
  public endDate = moment().endOf('d').toDate();

  public selectedUnit = ConsumptionUnit.KILOWATT;

  public unitMap = [
    { key: ConsumptionUnit.KILOWATT, description: 'transactions.graph.unit_kilowatts' },
    { key: ConsumptionUnit.AMPERE, description: 'transactions.graph.unit_amperage' }
  ];

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

  constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: AppDecimalPipe) {
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
    this.centralServerService.getSiteArea(this.siteAreaId)
    .subscribe((siteArea) => {
      this.siteArea = siteArea;
    }, (error) => {
      delete this.siteAreaConsumption;
    });
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
    this.centralServerService.getSiteAreaConsumption(this.siteAreaId, this.startDate, this.endDate)
      .subscribe((siteAreaConsumption) => {
        this.spinnerService.hide();
        this.siteAreaConsumption = siteAreaConsumption;
        this.prepareOrUpdateGraph();
      }, (error) => {
        this.spinnerService.hide();
        delete this.siteAreaConsumption;
      });
  }

  public unitChanged() {
    this.refresh();
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
    if (this.data.datasets && this.options.scales && this.options.scales.yAxes) {
      const datasets: ChartDataSets[] = [];
      datasets.push({
        name: 'instantPower',
        type: 'line',
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerColor),
        label: this.translateService.instant('organization.graph.power'),
      });
      this.options.scales.yAxes.push({
        id: 'power',
        ticks: {
          callback: (value: number) => this.selectedUnit === ConsumptionUnit.AMPERE ? value : value / 1000.0,
          min: 0,
        },
      });
      datasets.push({
        name: 'limitWatts',
        type: 'line',
        data: [],
        hidden: true,
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitColor),
        label: this.translateService.instant('organization.graph.limit_watts'),
      });
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
    return this.siteAreaConsumption && this.siteAreaConsumption.values && this.siteAreaConsumption.values.length > 1;
  }

  private refreshDataSets() {
    if (this.data.datasets) {
      for (const key of Object.keys(this.data.datasets)) {
        this.data.datasets[key].data = [];
      }
      const instantPowerDataSet = this.getDataSet('instantPower');
      const limitWattsDataSet = this.getDataSet('limitWatts');
      const labels: number[] = [];
      for (const consumption of this.siteAreaConsumption.values) {
        labels.push(new Date(consumption.date).getTime());
        instantPowerDataSet.push(
        this.selectedUnit === ConsumptionUnit.AMPERE ?
            ChargingStations.convertWattToAmp(
              this.siteArea.numberOfPhases,
              consumption.instantPower) :
            consumption.instantPower);
        if (limitWattsDataSet) {
          if (consumption.limitWatts) {
            limitWattsDataSet.push(
            this.selectedUnit === ConsumptionUnit.AMPERE ?
            ChargingStations.convertWattToAmp(
              this.siteArea.numberOfPhases,
              consumption.limitWatts) :
            consumption.limitWatts);
          } else {
            limitWattsDataSet.push(limitWattsDataSet.length > 0 ? limitWattsDataSet[limitWattsDataSet.length - 1] : 0);
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
            if (this.data.datasets && data.datasets && tooltipItem.datasetIndex !== undefined) {
              const dataSet = data.datasets[tooltipItem.datasetIndex];
              if (dataSet && dataSet.data && tooltipItem.index !== undefined) {
                const value = dataSet.data[tooltipItem.index] as number;
                switch (this.data.datasets[tooltipItem.datasetIndex]['name']) {
                  case 'instantPower':
                    if (this.selectedUnit === ConsumptionUnit.AMPERE) {
                      return ' ' + this.decimalPipe.transform(value, '2.0-0') + 'A';
                    }
                    return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kW';
                  case 'limitWatts':
                    if (this.selectedUnit === ConsumptionUnit.AMPERE) {
                      return ' ' + this.decimalPipe.transform(value, '2.0-0') + 'A';
                    }
                    return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kW';
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
              if (item[0].index !== undefined) {
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
              callback: (value: number) => {
                const result = this.selectedUnit === ConsumptionUnit.AMPERE ?
                this.decimalPipe.transform(value, '1.0-0') : this.decimalPipe.transform(value / 1000, '1.0-0');
                return result ? parseFloat(result) : 0;
              },
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
