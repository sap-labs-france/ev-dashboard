import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartColor, ChartData, ChartDataSets, ChartOptions, ChartPoint, ChartTooltipItem } from 'chart.js';
import * as moment from 'moment';

import { LocaleService } from '../../../../services/locale.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal-pipe';
import { AppDurationPipe } from '../../../../shared/formatters/app-duration.pipe';
import { Schedule } from '../../../../types/ChargingProfile';
import { ChargePoint, ChargingStation, ChargingStationPowers } from '../../../../types/ChargingStation';
import { ConsumptionUnit } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-smart-charging-limit-planner-chart',
  template: `
    <div>
      <div class="btn-group mat-button-group">
        <app-chart-unit-selector (unitChanged)="unitChanged($event)"></app-chart-unit-selector>
      </div>
    </div>
    <div class="chart-container chart-container-profiles">
      <div #primary class='chart-primary'></div>
      <div #danger class='chart-danger'></div>
      <canvas #chart></canvas>
    </div>
  `,
})
export class ChargingPlanChartComponent implements OnChanges {
  @Input() public ratio!: number;
  @Input() public chargingStation!: ChargingStation;
  @Input() public connectorId!: number;
  @Input() public chargingSchedules: Schedule[];

  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;


  public selectedUnit = ConsumptionUnit.KILOWATT;

  private graphCreated = false;
  private chart!: Chart;
  private options!: ChartOptions;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private language!: string;
  private instantPowerColor!: string;
  private limitColor!: string;
  private defaultColor!: string;
  private lineTension = 0;

  constructor(
    private translateService: TranslateService,
    private durationPipe: AppDurationPipe,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private decimalPipe: AppDecimalPipe) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
  }

  public ngOnChanges() {
    this.prepareAndCreateGraphData();
  }

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  public unitChanged(key: ConsumptionUnit) {
    this.selectedUnit = key;
    this.prepareAndCreateGraphData();
  }

  private prepareOrUpdateGraph() {
    if (!this.graphCreated) {
      this.graphCreated = true;
      // Get colors
      this.instantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
      this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
      this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
      // Build chart options
      this.options = this.createOptions();
      // Create Chart
      this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'), {
        type: 'bar',
        data: this.data,
        options: this.options,
      });
    }
    this.chart.update();
  }

  private prepareAndCreateGraphData() {
    // Init
    this.prepareOrUpdateGraph();
    // Create chart
    if (this.data && this.data.datasets && this.data.labels) {
      this.data.labels = [];
      this.data.datasets = [];
      // Fill
      this.createGraphData();
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private createGraphData() {
    // Clear
    if (this.data && this.data.datasets && this.data.labels) {
      const labels: number[] = [];
      const datasets: ChartDataSets[] = [];
      // Build Schedules dataset
      const chargingSlotDataSet: ChartDataSets = {
        type: 'line',
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.plan_amps' : 'transactions.graph.plan_watts'),
      };
      // Create Schedule chart points
      for (const chargingSlot of this.chargingSchedules) {
        labels.push(chargingSlot.startDate.getTime());
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime(),
          y: (this.selectedUnit === ConsumptionUnit.AMPERE) ? chargingSlot.limit : chargingSlot.limitInkW,
        } as number & ChartPoint);
      }
      // Create the last Schedule point with the last duration
      if (chargingSlotDataSet.data && this.chargingSchedules.length > 0) {
        const chargingSlot = this.chargingSchedules[this.chargingSchedules.length - 1];
        labels.push(chargingSlot.startDate.getTime() + chargingSlot.duration * 60 * 1000);
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime() - 1000 + chargingSlot.duration * 60 * 1000,
          y: (this.selectedUnit === ConsumptionUnit.AMPERE) ? chargingSlot.limit : chargingSlot.limitInkW,
        } as number & ChartPoint);
      }
      datasets.push(chargingSlotDataSet);
      // Build Max Limit dataset
      const limitDataSet: ChartDataSets = {
        name: 'limitWatts',
        type: 'line',
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.limit_plan_amps' : 'transactions.graph.limit_plan_watts'),
      };
      let chargingStationPowers: ChargingStationPowers;
      let chargePoint: ChargePoint;
      if (this.connectorId > 0) {
        const connector = Utils.getConnectorFromID(this.chargingStation, this.connectorId);
        chargePoint = Utils.getChargePointFromID(this.chargingStation, connector.chargePointID);
        chargingStationPowers = Utils.getChargingStationPowers(this.chargingStation, chargePoint, this.connectorId);
      } else {
        chargingStationPowers = Utils.getChargingStationPowers(this.chargingStation);
      }
      // Add First and Last Max Limit points
      for (const data of chargingSlotDataSet.data) {
        // First
        limitDataSet.data.push({
          x: (data as ChartPoint).x,
          y: (this.selectedUnit === ConsumptionUnit.AMPERE) ? chargingStationPowers.currentAmp : chargingStationPowers.currentWatt / 1000,
        } as number & ChartPoint);
      }
      // Push in the graph
      datasets.push(limitDataSet);
      // Assign
      this.data.labels = labels;
      this.data.datasets = datasets;
      // Update
      this.chart.update();
    }
  }

  private createOptions(): ChartOptions {
    const locale = moment.localeData(this.language);
    const options: ChartOptions = {
      animation: {
        duration: 0,
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      responsive: true,
      maintainAspectRatio: this.ratio ? true : false,
      aspectRatio: this.ratio,
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
            if (data.datasets && !Utils.isUndefined(tooltipItem.datasetIndex)) {
              const dataSet = data.datasets[tooltipItem.datasetIndex];
              if (dataSet && dataSet.data && !Utils.isUndefined(tooltipItem.index)) {
                const chartPoint = dataSet.data[tooltipItem.index] as ChartPoint;
                if (chartPoint) {
                  const value = chartPoint.y as number;
                  if (this.selectedUnit === ConsumptionUnit.AMPERE) {
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + 'A';
                  }
                  return ' ' + this.decimalPipe.transform(value, '1.0-2') + 'kW';
                }
              }
            }
            return '';
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            if (data.labels) {
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
              unit: 'hour',
              displayFormats: {
                hour: locale.longDateFormat('LT'),
              },
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 20,
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
              callback: (value: number) => (this.selectedUnit === ConsumptionUnit.AMPERE) ?
                parseInt(this.decimalPipe.transform(value, '1.0-0')) + 'A' :
                parseInt(this.decimalPipe.transform(value, '1.0-2')) + ((value < 1000) ? 'W' : 'kW'),
              fontColor: this.defaultColor,
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
        ],
      },
      elements: {
        line: {
          stepped: true,
        },
      },
    };
    return options;
  }
}
