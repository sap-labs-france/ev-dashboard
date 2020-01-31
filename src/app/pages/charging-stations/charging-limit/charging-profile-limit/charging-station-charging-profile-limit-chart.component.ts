import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'app/services/locale.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { Slot } from 'app/types/ChargingProfile';
import { Utils } from 'app/utils/Utils';
import { Chart, ChartColor, ChartData, ChartDataSets, ChartOptions, ChartPoint, ChartTooltipItem } from 'chart.js';
import * as moment from 'moment';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal-pipe';

@Component({
  selector: 'app-charging-station-smart-charging-limit-planner-chart',
  template: `
    <div class="chart-container" style="position: relative; height:27vh;">
      <div #primary class='chart-primary'></div>
      <canvas #chart></canvas>
    </div>
  `,
})
export class ChargingStationSmartChargingLimitPlannerChartComponent {
  @Input() ratio!: number;

  @ViewChild('primary', {static: true}) primaryElement!: ElementRef;
  @ViewChild('chart', {static: true}) chartElement!: ElementRef;

  private graphCreated = false;
  private chart!: Chart;
  private options!: ChartOptions;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private language!: string;
  private instantPowerColor!: string;
  private defaultColor!: string;
  private lineTension = 0;
  public chargingSlots!: Slot[];

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

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (!this.graphCreated) {
      this.graphCreated = true;
      // Get colors
      this.instantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
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

  public setLimitPlannerData(chargingSlots: Slot[]) {
    this.prepareOrUpdateGraph();
    // Get colors
    // Keep list
    this.chargingSlots = chargingSlots;
    // Create chart
    if (this.data && this.data.datasets && this.data.labels) {
      this.data.labels.length = 0;
      this.data.datasets.length = 0;
      // Fill
      if (chargingSlots && chargingSlots.length > 0) {
        this.createGraphData(chargingSlots);
      }
    }
  }

  private createGraphData(chargingSlots: Slot[]) {
    // Clear
    if (this.data && this.data.datasets && this.data.labels) {
      this.data.labels.length = 0;
      this.data.datasets.length = 0;
      // Line label
      const chargingSlotDataSet: ChartDataSets = {
        type: 'line',
        data: [],
        yAxisID: 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerColor),
      };
      // Build slots
      for (const chargingSlot of chargingSlots) {
        // Add a point
        if (this.data.labels && chargingSlotDataSet.data) {
          this.data.labels.push(chargingSlot.startDate.getTime());
          chargingSlotDataSet.data.push({
            x: chargingSlot.startDate.getTime(),
            y: chargingSlot.limitInkW,
          } as number & ChartPoint);
        }
      }
      // Create the last point with the duration
      if (chargingSlotDataSet.data && chargingSlots.length > 0) {
        const chargingSlot = chargingSlots[chargingSlots.length-1];
        this.data.labels.push(chargingSlot.startDate.getTime() + chargingSlot.duration * 60 * 1000);
        chargingSlotDataSet.data.push({
          x: chargingSlot.startDate.getTime() - 1000 + chargingSlot.duration * 60 * 1000,
          y: chargingSlot.limitInkW,
        } as number & ChartPoint);
      }
      // Push in the graph
      if (this.data.datasets) {
        this.data.datasets.push(chargingSlotDataSet);
      }
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
        display: false,
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
            if (data.datasets && tooltipItem.datasetIndex !== undefined) {
              const dataSet = data.datasets[tooltipItem.datasetIndex];
              if (dataSet && dataSet.data && tooltipItem.index !== undefined) {
                const chartPoint = dataSet.data[tooltipItem.index] as ChartPoint;
                if (chartPoint) {
                  const value = chartPoint.y as number;
                  return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
                }
              }
            }
            return '';
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            if (data.labels) {
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
