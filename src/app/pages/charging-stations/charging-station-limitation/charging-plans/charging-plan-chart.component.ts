import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartData, ChartDataset, ChartOptions, Color, Point, TooltipItem } from 'chart.js';
import * as moment from 'moment';

import { LocaleService } from '../../../../services/locale.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal.pipe';
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

  public constructor(
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
      this.instantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
      this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
      this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
      // Build chart options
      this.options = this.createOptions();
      // Create Chart
      this.chart = new Chart(this.chartElement.nativeElement, {
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
        } as number & Point);
      }
      // Create the last Schedule point with the last duration
      if (chargingSlotDataSet.data && !Utils.isEmptyArray(this.chargingSchedules)) {
        const chargingSlot = this.chargingSchedules[this.chargingSchedules.length - 1];
        labels.push(chargingSlot.startDate.getTime() + chargingSlot.duration * 60 * 1000);
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime() - 1000 + chargingSlot.duration * 60 * 1000,
          y: (this.selectedUnit === ConsumptionUnit.AMPERE) ? chargingSlot.limit : chargingSlot.limitInkW,
        } as number & Point);
      }
      datasets.push(chargingSlotDataSet);
      // Build Max Limit dataset
      const limitDataSet: ChartDataset = {
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
          x: (data as Point).x,
          y: (this.selectedUnit === ConsumptionUnit.AMPERE) ? chargingStationPowers.currentAmp : chargingStationPowers.currentWatt / 1000,
        } as number & Point);
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
          multiKeyBackground: Utils.toRgba(this.instantPowerColor, 0.7),
          intersect: false,
          callbacks: {
            // labelColor: (context) => {
            //   borderColor: 'rgba(0,0,0,0)',
            //   backgroundColor: this.data.datasets && tooltipItem.datasetIndex ?
            //     this.data.datasets[tooltipItem.datasetIndex].borderColor as Color : '',
            // },
            // label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
            //   if (data.datasets && !Utils.isUndefined(tooltipItem.datasetIndex)) {
            //     const dataSet = data.datasets[tooltipItem.datasetIndex];
            //     if (dataSet && dataSet.data && !Utils.isUndefined(tooltipItem.index)) {
            //       const chartPoint = dataSet.data[tooltipItem.index] as Point;
            //       if (chartPoint) {
            //         const value = chartPoint.y as number;
            //         if (this.selectedUnit === ConsumptionUnit.AMPERE) {
            //           return ' ' + this.decimalPipe.transform(value, '1.0-0') + 'A';
            //         }
            //         return ' ' + this.decimalPipe.transform(value, '1.0-2') + 'kW';
            //       }
            //     }
            //   }
            //   return '';
            // },
            // title: (item: ChartTooltipItem[], data: ChartData) => {
            //   if (data.labels) {
            //     const firstDate = new Date(data.labels[0] as number);
            //     if (!Utils.isUndefined(item[0].index)) {
            //       const currentDate = new Date(data.labels[item[0].index] as number);
            //       return this.datePipe.transform(currentDate) + ' - ' +
            //         this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000);
            //     }
            //   }
            //   return '';
            // },
          },
        },
        // hover: {
        //   mode: 'index',
        //   intersect: false,
        // },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: locale.longDateFormat('LT'),
            unit: 'hour',
            displayFormats: {
              hour: locale.longDateFormat('LT'),
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
        power: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: (value: number) => (this.selectedUnit === ConsumptionUnit.AMPERE) ?
              parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'A' :
              parseInt(this.decimalPipe.transform(value, '1.0-2'), 10) + 'kW',
            color: this.defaultColor,
          },
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
