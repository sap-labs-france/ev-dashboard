import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartData, ChartDataset, ChartOptions, Color, Point } from 'chart.js';
import * as moment from 'moment';
import { ConsumptionChartAxis, ConsumptionChartDatasetOrder } from 'types/Chart';

import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal.pipe';
import { AppDurationPipe } from '../../../../shared/formatters/app-duration.pipe';
import { Schedule } from '../../../../types/ChargingProfile';
import {
  ChargePoint,
  ChargingStation,
  ChargingStationPowers,
} from '../../../../types/ChargingStation';
import { ConsumptionUnit } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-charging-station-smart-charging-limit-planner-chart',
  template: `
    <div class="row">
      <div class="offset-8 col-4">
        <app-chart-unit-selector (unitChanged)="unitChanged($event)"></app-chart-unit-selector>
      </div>
    </div>
    <div class="chart-container chart-container-profiles">
      <div #purple class="chart-purple"></div>
      <div #primary class="chart-primary"></div>
      <div #danger class="chart-danger"></div>
      <canvas #chart></canvas>
    </div>
  `,
})
export class ChargingPlanChartComponent implements OnChanges {
  @Input() public ratio!: number;
  @Input() public chargingStation!: ChargingStation;
  @Input() public connectorId!: number;
  @Input() public chargingSchedules: Schedule[];

  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('purple', { static: true }) public purpleElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;

  public selectedUnit = ConsumptionUnit.KILOWATT;

  private graphCreated = false;
  private chart!: Chart;
  private options!: ChartOptions;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private limitChargingPlan!: string;
  private limitMax!: string;
  private defaultColor!: string;
  private lineTension = 0;
  private firstLabel: number;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private translateService: TranslateService,
    private durationPipe: AppDurationPipe,
    private datePipe: AppDatePipe,
    private decimalPipe: AppDecimalPipe
  ) {}

  public ngOnChanges() {
    this.prepareAndCreateGraphData();
  }

  public unitChanged(key: ConsumptionUnit) {
    this.selectedUnit = key;
    this.prepareAndCreateGraphData();
  }
  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (!this.graphCreated) {
      this.graphCreated = true;
      // Get colors
      this.limitMax = this.getStyleColor(this.purpleElement.nativeElement);
      this.limitChargingPlan = this.getStyleColor(this.dangerElement.nativeElement);
      this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
      // Build chart options
      this.options = this.createOptions();
      // Create Chart
      this.chart = new Chart(this.chartElement.nativeElement, {
        type: 'line',
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

  // eslint-disable-next-line complexity
  private createGraphData() {
    // Clear
    if (this.data && this.data.datasets && this.data.labels) {
      const labels: number[] = [];
      const datasets: ChartDataset[] = [];
      // Build Schedules dataset
      const chargingSlotDataSet: ChartDataset = {
        type: 'line',
        data: [],
        yAxisID:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartAxis.AMPERAGE
            : ConsumptionChartAxis.POWER,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitChargingPlan),
        label: this.translateService.instant(
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? 'transactions.graph.limit_plan_amps'
            : 'transactions.graph.limit_plan_watts'
        ),
        order:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartDatasetOrder.PLAN_AMPS
            : ConsumptionChartDatasetOrder.PLAN_WATTS,
        fill: 'origin',
      };
      // Create Schedule chart points
      for (const chargingSlot of this.chargingSchedules) {
        labels.push(chargingSlot.startDate.getTime());
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime(),
          y:
            this.selectedUnit === ConsumptionUnit.AMPERE
              ? chargingSlot.limit
              : chargingSlot.limitInkW,
        } as number & Point);
      }
      // Create the last Schedule point with the last duration
      if (chargingSlotDataSet.data && !Utils.isEmptyArray(this.chargingSchedules)) {
        const chargingSlot = this.chargingSchedules[this.chargingSchedules.length - 1];
        labels.push(chargingSlot.startDate.getTime() + chargingSlot.duration * 60 * 1000);
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime() - 1000 + chargingSlot.duration * 60 * 1000,
          y:
            this.selectedUnit === ConsumptionUnit.AMPERE
              ? chargingSlot.limit
              : chargingSlot.limitInkW,
        } as number & Point);
      }
      datasets.push(chargingSlotDataSet);
      // Build Max Limit dataset
      const limitDataSet: ChartDataset = {
        type: 'line',
        data: [],
        yAxisID:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartAxis.AMPERAGE
            : ConsumptionChartAxis.POWER,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitMax),
        label: this.translateService.instant(
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? 'transactions.graph.plan_amps'
            : 'transactions.graph.plan_watts'
        ),
        order:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartDatasetOrder.LIMIT_AMPS
            : ConsumptionChartDatasetOrder.LIMIT_WATTS,
      };
      let chargingStationPowers: ChargingStationPowers;
      let chargePoint: ChargePoint;
      if (this.connectorId > 0) {
        const connector = Utils.getConnectorFromID(this.chargingStation, this.connectorId);
        chargePoint = Utils.getChargePointFromID(this.chargingStation, connector.chargePointID);
        chargingStationPowers = Utils.getChargingStationPowers(
          this.chargingStation,
          chargePoint,
          this.connectorId
        );
      } else {
        chargingStationPowers = Utils.getChargingStationPowers(this.chargingStation);
      }
      // Add First Limit points
      for (const data of chargingSlotDataSet.data) {
        // First
        limitDataSet.data.push({
          x: (data as Point).x,
          y:
            this.selectedUnit === ConsumptionUnit.AMPERE
              ? chargingStationPowers.currentAmp
              : chargingStationPowers.currentWatt / 1000,
        } as number & Point);
      }
      // Push in the graph
      datasets.push(limitDataSet);
      // Assign
      this.data.labels = labels;
      this.firstLabel = labels[0];
      this.data.datasets = datasets;
      // Update
      this.chart.update();
    }
  }

  private createOptions(): ChartOptions {
    const options: ChartOptions = {
      animation: {
        duration: 0,
      },
      responsive: true,
      maintainAspectRatio: this.ratio ? true : false,
      aspectRatio: this.ratio,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
        },
        tooltip: {
          bodySpacing: 5,
          mode: 'index',
          position: 'nearest',
          multiKeyBackground: Utils.toRgba(this.limitChargingPlan, 0.7),
          intersect: false,
          callbacks: {
            labelColor: (context) => ({
              borderColor: context.dataset.borderColor as Color,
              backgroundColor: context.dataset.borderColor as Color,
              dash: context.dataset.borderDash,
            }),
            label: (context) => {
              let tooltipLabel = '';
              const label = context.dataset.label;
              const dataset = context.dataset;
              const chartPoint = dataset.data[context.dataIndex] as Point;
              if (chartPoint) {
                const value = chartPoint.y as number;
                if (this.selectedUnit === ConsumptionUnit.AMPERE) {
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A';
                } else {
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' kW';
                }
              }
              return `${label}: ${tooltipLabel}`;
            },
            title: (tooltipItems) => {
              const firstDate = new Date(this.firstLabel);
              const currentDate = new Date(tooltipItems[0].parsed.x);
              return (
                this.datePipe.transform(currentDate) +
                ' - ' +
                this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000)
              );
            },
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        [ConsumptionChartAxis.X]: {
          type: 'time',
          time: {
            tooltipFormat: moment.localeData().longDateFormat('LT'),
            unit: 'hour',
            displayFormats: {
              hour: moment.localeData().longDateFormat('LT'),
            },
          },
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            autoSkip: true,
            color: this.defaultColor,
          },
        },
        [ConsumptionChartAxis.POWER]: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value: number) =>
              parseInt(this.decimalPipe.transform(value, '1.0-2'), 10) + 'kW',
            color: this.defaultColor,
          },
          display: 'auto',
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
        },
        [ConsumptionChartAxis.AMPERAGE]: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value: number) =>
              parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'A',
            color: this.defaultColor,
          },
          display: 'auto',
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
        },
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
