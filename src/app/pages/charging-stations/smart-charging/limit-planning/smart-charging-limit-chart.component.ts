import { Component, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ConsumptionValue, ConnectorSchedule } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'app/services/locale.service';
import { DecimalPipe } from '@angular/common';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { AppConnectorIdPipe } from 'app/shared/formatters/app-connector-id.pipe';
import * as moment from 'moment';
import { ChartComponent } from 'angular2-chartjs';

@Component({
  selector: 'app-limit-planning-chart',
  styleUrls: ['smart-charging-limit-chart.component.scss'],
  template: `
    <div class="chart-container">
      <div class="chart">
        <chart #chart *ngIf="data"
               type="line"
               [data]="data"
               [options]="options"></chart>
      </div>
      <div *ngIf="limitPlanning && limitPlanning.length > 0" class="icon-left">
        <a
          [class]="'btn btn-link btn-just-icon'"
          (click)="resetZoom()"><i class="material-icons">zoom_out_map</i></a>
      </div>
    </div>
  `
})

export class SmartChargingLimitChartComponent implements OnInit, AfterViewInit {
  @Input() limitPlanning: ConnectorSchedule[];

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
    if (this.limitPlanning && this.limitPlanning.length > 0) {
      this.createGraphData(this.limitPlanning);
    }
  }

  ngAfterViewInit(): void {
  }

  createGraphData(limitPlanning: ConnectorSchedule[]) {
    this.options = this.createOptions(limitPlanning);
    let distanceBetween2points = 1;
    this.data = {
      labels: [],
      datasets: []
    }
    // build for each connectors
    for (let index = 0; index < limitPlanning.length; index++) {
      const connectorPlanning = limitPlanning[index];
      // calculate distance
      distanceBetween2points = 1;
      // Build single connector data set
      // Line label
      const connectorLabel = (connectorPlanning.connectorId === 0 ?
        this.translateService.instant('chargers.connector0') :
        this.translateService.instant('chargers.connector') + ' ' +
        this.connectorIdPipe.transform(connectorPlanning.connectorId));
      const axisId = 'power';
      const limitPowerDataSet = {
        data: [],
        yAxisID: axisId,
        ...this.formatLineColor(this.colors[index]),
        label: connectorLabel
      };
      // Add each slots
      for (let i = 0; i < connectorPlanning.slots.length; i++) {
        const limit = connectorPlanning.slots[i];
        this.data.labels.push(limit.start.getTime());
        limitPowerDataSet.data.push(limit.limit);
        if (i === connectorPlanning.slots.length - 1) {
          // Add last limit
          if (limit.end) {
            this.data.labels.push(limit.end.getTime());
            limitPowerDataSet.data.push(limit.limit);
          } else {
            this.data.labels.push(limit.start.getTime() + 3600000); // Add one hour
            limitPowerDataSet.data.push(limit.limit);
          }
        }
      }
      // Push in the graph
      this.data.datasets.push(limitPowerDataSet);
    }
  }

  createOptions(limitPlanning: ConnectorSchedule[]) {
    const options: any = {
      legend: {
        position: 'bottom',
        labels: {
          fontColor: 'white'
        }
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
          labelColor: (tooltipItem, chart) => {
            return {
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: this.rgba(this.colors[tooltipItem.datasetIndex], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
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
            },
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.2)'
            },
            ticks: {
              fontColor: 'white'
            }
          }
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              callback: (value, index, values) => this.decimalPipe.transform(value),
              fontColor: 'white'
            },
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.2)'
            }
          }
        ]
      },
      pan: {
        enabled: true,
        mode: 'x',
        /*        rangeMin: {
                  x: limitPlanning.length > 0 ? limitPlanning[0].slots[0].start.getTime() : 0,
                },
                rangeMax: {
                  x: limitPlanning.length > 0 ? limitPlanning[0].slots[limitPlanning[0].slots.length - 1].start.getTime() : 0
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


}
