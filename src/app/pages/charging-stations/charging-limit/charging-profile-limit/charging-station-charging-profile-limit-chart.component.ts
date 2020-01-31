import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartComponent } from 'angular2-chartjs';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { AppDurationPipe } from 'app/shared/formatters/app-duration.pipe';
import { Slot } from 'app/types/ChargingProfile';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal-pipe';

@Component({
  selector: 'app-charging-station-smart-charging-limit-planner-chart',
  template: `
    <div class="chart-container">
      <chart #chart *ngIf="data" type="line" [data]="data" [options]="options"></chart>
      <div class="icon-left">
        <a mat-icon-button (click)="resetZoom()"><mat-icon>zoom_out_map</mat-icon></a>
      </div>
    </div>
  `,
})
export class ChargingStationSmartChargingLimitPlannerChartComponent implements OnInit {
  @Input() ratio!: number;
  @ViewChild('chart', { static: false }) chartComponent!: ChartComponent;
  public data: any;
  private options: any;
  private colors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86],
  ];
  private language!: string;

  constructor(private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private durationPipe: AppDurationPipe,
      private localeService: LocaleService,
      private datePipe: AppDatePipe,
      private decimalPipe: AppDecimalPipe) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
  }

  public resetZoom() {
    this.chartComponent.chart.resetZoom();
  }

  ngOnInit(): void {
  }

  public setLimitPlannerData(chargingSlots: Slot[]) {
    if (chargingSlots && chargingSlots.length > 0) {
      this.createGraphData(chargingSlots);
    } else {
      // clear graph
      this.options = null;
      this.data = null;
    }
  }

  private createGraphData(chargingSlots: Slot[]) {
    this.options = this.createOptions(chargingSlots);
    // Clear
    this.data = {
      labels: [],
      datasets: [],
    };
    // Line label
    const connectorLabel = this.translateService.instant('chargers.connector0');
    const axisId = 'power';
    const chargingSlotDataSet = {
      data: [],
      yAxisID: axisId,
      ...this.formatLineColor(this.colors[0]),
      label: connectorLabel,
    };
    // Build slots
    for (const chargingSlot of chargingSlots) {
      // Add a point
      this.data.labels.push(chargingSlot.startDate.getTime());
      chargingSlotDataSet.data.push({
        x: chargingSlot.startDate.getTime(),
        y: chargingSlot.limitInkW,
      });
      // Add a second point for the duration
      this.data.labels.push(chargingSlot.startDate.getTime() + chargingSlot.duration * 60 * 1000);
      chargingSlotDataSet.data.push({
        x: chargingSlot.startDate.getTime() - 1000 + chargingSlot.duration * 60 * 1000,
        y: chargingSlot.limitInkW,
      });
    }
    // Push in the graph
    this.data.datasets.push(chargingSlotDataSet);
  }

  private createOptions(chargingSlots: Slot[]) {
    const options: any = {
      legend: {
        position: 'bottom',
        labels: {
          fontColor: '#0d47a1',
        },
      },
      responsive: true,
      aspectRatio: this.ratio,
      tooltips: {
        bodySpacing: 5,
        mode: 'index',
        position: 'nearest',
        multiKeyBackground: 'rgba(0,0,0,0)',
        intersect: false,
        callbacks: {
          labelColor: (tooltipItem: any, chart: ChartComponent) => {
            return {
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: this.rgba(this.colors[tooltipItem.datasetIndex], 1),
            };
          },
          label: (tooltipItem: any, values: any) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
            return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
          },
          title: (tooltipItems: any, data: any) => {
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
            distribution: 'linear',
            time: {
              tooltipFormat: 'h:mm',
              unit: 'minute',
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              fontColor: '#0d47a1',
            },
          },
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            min: 0,
            stepSize: 1,
            ticks: {
              callback: (value: number) => this.decimalPipe.transform(value / 1000, '1.0-0'),
              fontColor: '#0d47a1',
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
        // rangeMin: {
        //   x: chargingSlots.length > 0 ? chargingSlots[0].slots[0].start.getTime() : 0,
        // },
        // rangeMax: {
        //   x: chargingSlots.length > 0 ? chargingSlots[0].slots[chargingSlots[0].slots.length - 1].start.getTime() : 0,
        // },
      },
      zoom: {
        enabled: false,
        drag: false,
        mode: 'x',
        sensitivity: 10,
      },
      elements: {
        line: {
          stepped: true,
        },
      },
    };
    if (this.language === 'fr') {
      options.scales.xAxes[0].time = {
        tooltipFormat: 'HH:mm',
        displayFormats: {
          millisecond: 'HH:mm:ss.SSS',
          second: 'HH:mm:ss',
          minute: 'HH:mm',
          hour: 'HH',
        },
      };
    }
    return options;
  }

  private formatLineColor(colors: number[]): any {
    return {
      backgroundColor: this.rgba(colors, 0.4),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff',
    };
  }

  private rgba(colour: number[], alpha: number): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
  }
}
