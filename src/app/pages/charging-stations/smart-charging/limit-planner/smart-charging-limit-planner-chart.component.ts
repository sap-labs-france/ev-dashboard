import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ConsumptionValue } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'app/services/locale.service';
import { DecimalPipe } from '@angular/common';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { AppConnectorIdPipe } from 'app/shared/formatters/app-connector-id.pipe';
import * as moment from 'moment';
import { ChartComponent } from 'angular2-chartjs';
import { DisplayedScheduleSlot } from './smart-charging-limit-planner.component';

@Component({
  selector: 'app-limit-planner-chart',
  styleUrls: ['smart-charging-limit-planner-chart.component.scss'],
  template: `
    <div class="chart-container">
      <div class="chart">
        <chart #chart *ngIf="data"
               type="line"
               [data]="data"
               [options]="options"></chart>
      </div>
      <div *ngIf="scheduleSlots && scheduleSlots.length > 0" class="icon-left">
        <a
          [class]="'btn btn-link btn-just-icon'"
          (click)="resetZoom()"><i class="material-icons">zoom_out_map</i></a>
      </div>
    </div>
  `
})

export class SmartChargingLimitPlannerChartComponent implements OnInit, AfterViewInit {
  @Input() scheduleSlots: DisplayedScheduleSlot[];

  @Input() ratio: number;
  data: any;
  options: any;
  @ViewChild('chart') chartComponent: ChartComponent;
  private colors = [
    [255, 99, 132],
    [54, 162, 235],
    [255, 206, 86]
  ];

  constructor(private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private decimalPipe: DecimalPipe,
    private connectorIdPipe: AppConnectorIdPipe) {
  }

  resetZoom() {
    this.chartComponent.chart.resetZoom();
  }

  ngOnInit(): void {
    if (this.scheduleSlots && this.scheduleSlots.length > 0) {
      this.createGraphData(this.scheduleSlots);
    }
  }

  setLimitPlannerData(scheduleSlots: DisplayedScheduleSlot[]) {
    this.scheduleSlots = scheduleSlots;
    if (scheduleSlots && scheduleSlots.length > 0) {
      this.createGraphData(this.scheduleSlots);
    } else {
      // clear graph
      this.options = null;
      this.data = null;
    }
  }

  ngAfterViewInit(): void {
    /*
        this.chartComponent.clickDataset.next((value) => {
          console.log('ClickDataSet' + JSON.stringify(value));
        });
        this.chartComponent.clickElement.next((value) => {
          console.log('ClickElement' + JSON.stringify(value));
        });
    */
  }

  createGraphData(scheduleSlots: DisplayedScheduleSlot[]) {
    this.options = this.createOptions(scheduleSlots);
    this.data = {
      labels: [],
      datasets: []
    }
    // Build single connector data set
    // Line label
    const connectorLabel = this.translateService.instant('chargers.connector0');
    const axisId = 'power';
    const limitPowerDataSet = {
      data: [],
      yAxisID: axisId,
      ...this.formatLineColor(this.colors[0]),
      label: connectorLabel
    };
    // Push in the graph
    this.data.datasets.push(limitPowerDataSet);
    // build for each connectors
    for (let index = 0; index < scheduleSlots.length; index++) {
      const connectorPlanning = scheduleSlots[index];
      // Add slot
      const limit = connectorPlanning.slot;
      this.data.labels.push(limit.start.getTime());
      limitPowerDataSet.data.push({
        x: limit.start.getTime(), y: limit.displayedLimitInkW, click: (element) => {
          this.chartEvent(element, null);
        }
      });
      if (index === scheduleSlots.length - 1) {
        // Add last limit
        if (limit.end && limit.end.getTime() !== limit.start.getTime()) {
          this.data.labels.push(limit.end.getTime());
          limitPowerDataSet.data.push({
            x: limit.end.getTime(), y: limit.displayedLimitInkW, click: (element) => {
              this.chartEvent(element, null);
            }
          });
        } else {
          this.data.labels.push(limit.start.getTime() + 3600000); // Add one hour
          limitPowerDataSet.data.push({
            x: limit.start.getTime() + 3600000, y: limit.displayedLimitInkW, click: (element) => {
              this.chartEvent(element, null);
            }
          });
        }
      }
    }
  }

  createOptions(scheduleSlots: DisplayedScheduleSlot[]) {
    const options: any = {
      legend: { position: 'bottom' },
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
              backgroundColor: this.rgba(this.colors[tooltipItem.datasetIndex], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
            return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
          },
          title: (tooltipItems, data) => {
            const firstDate = data.labels[0];
            const currentDate = data.labels[tooltipItems[0].index];

            return this.datePipe.transform(currentDate, this.localeService.getCurrentFullLocaleForJS(), 'time') +
              ' - ' + moment.duration(moment(currentDate).diff(firstDate)).format('h[h]mm[m]', { trim: false });
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
            distribution: 'linear',
            time: {
              tooltipFormat: 'h:mm',
              unit: 'minute'
            }
          }
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            min: 0,
            stepSize: 1,
            ticks: {
              callback: (value, index, values) => this.decimalPipe.transform(value / 1000, '1.0-0')
            },
          }
        ]
      },
      pan: {
        enabled: true,
        mode: 'x',
        /*        rangeMin: {
                  x: scheduleSlots.length > 0 ? scheduleSlots[0].slots[0].start.getTime() : 0,
                },
                rangeMax: {
                  x: scheduleSlots.length > 0 ? scheduleSlots[0].slots[scheduleSlots[0].slots.length - 1].start.getTime() : 0
                },*/
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 10
      },
      elements: {
        line: {
          stepped: true
        }
      },
      onClick: (event, array) => {
        this.chartEvent(array, event);
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

  chartEvent(element, event) {
    console.log('Chart element ' + JSON.stringify(this.scheduleSlots[element[0]._index]));
    console.log('Chart event ' + JSON.stringify(event));
  }
}
