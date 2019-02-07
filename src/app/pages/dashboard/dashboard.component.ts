import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { RadialGaugeComponent } from 'app/shared/component/gauge/radial-gauge';
import { TranslateService } from '@ngx-translate/core';
import * as CanvasGauges from 'canvas-gauges';
import { animate, state, style, transition, trigger, AnimationEvent, query, group, sequence } from '@angular/animations';
import { DashboardService, SiteCurrentMetrics } from '../../services/dashboard.service';
import { SpinnerService } from 'app/services/spinner.service';
import * as moment from 'moment';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { DecimalPipe } from '@angular/common';
import { LocaleService } from 'app/services/locale.service';

const SLIDE_INTERVAL = 15000;
const CHART_INTERVAL = 3000;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.scss'],
  animations: [
    trigger('SlideChangeStart', [
      transition(':enter', []),
      transition('false => true', [
        group([
          query('.slide-card-up', [
            group([
//              animate('1.0s ease', style({ opacity: '0.05' })),
              animate('1.0s ease-in', style({ transform: 'translateY(-300%)' }))
            ])
          ], { optional: true }),
          query('.slide-card-right', [
            animate('1.0s ease', style({ opacity: '0.05' })),
//            style({ 'margin-left': '0%', width: '100%'}),
//            animate('1.0s ease-in', style({transform: 'translateX(300%)'})),
        ], { optional: true }),
        query('.slide-card-left', [
//          style({ 'margin-right': '0%', width: '100%'}),
            animate('1.0s ease', style({ opacity: '0.05' })),
//          animate('1.0s ease-in', style({transform: 'translateX(-300%)'})),
      ], { optional: true }),
          query('.fade-out-text', [
              animate('1.0s ease', style({ opacity: '0.6' })),
          ], { optional: true }),
        ])
      ]),
    ]),

    trigger('SlideChangeDone', [
      transition('false => true', [
        group([
          query('.slide-card-up, .fade-out-text', [
            group([
              animate('1.0s ease', style({ opacity: '1' })),
              animate('1.0s ease', style({ transform: 'translateY(0%)' }))
            ])
          ], { optional: true }),
          query('.slide-card-right, .slide-card-left', [
            animate('1.0s ease', style({ opacity: '1' })),
//            animate('1.0s ease-out', style({transform: 'translateX(0%)'})),
            ], { optional: true }),
/*          query('.trending-icon', [
              style({transform: `rotateX(${this.trendingConsumption})`})
              ], { optional: true }),*/
        ]),
      ])
    ])
  ]
})

export class DashboardComponent implements OnInit, AfterViewInit {

  beforeChange = false;
  afterChange = false;
  isCarouselPaused = false;
  carouselInterval;
  chartInterval;
  nextSiteIndex = -1;
  currentSiteIndex = -1;

  buttonsStatisticsChart = [
    { name: 'day', title: 'dashboard.statistics.button.day'},
    { name: 'week', title: 'dashboard.statistics.button.week'},
    { name: 'month', title: 'dashboard.statistics.button.month'},
    { name: 'year', title: 'dashboard.statistics.button.year'},
  ];
  chartStatisticsActiveButton = this.buttonsStatisticsChart[0].name;
  buttonsRealtimeChart = [
    { name: 'consumption', title: 'dashboard.realtime.button.consumption'},
    { name: 'utilization', title: 'dashboard.realtime.button.utilization'}
  ];
  chartRealtimeActiveButton = this.buttonsRealtimeChart[0].name;

  optionsLine: any;
  dataLine: any;
  optionsBar: any;
  dataBar: any;
  todayDay: any;
  trendingConsumptionValue = 0;
  trendingConsumption = `scale(0.6,0.6) rotate(${this.trendingConsumptionValue}deg)`;
  trendingInactivityValue = 0;
  trendingInactivity = `scale(0.6,0.6) rotate(${this.trendingInactivityValue}deg)`;

  currentMetrics: SiteCurrentMetrics;


  constructor(private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dashboardService: DashboardService,
    private datePipe: AppDatePipe,
    private decimalPipe: DecimalPipe,
    private localeService: LocaleService) {
  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.dashboardService.initialLoadDone.subscribe(isDone => {
      if (isDone) {
        // Get first site
        this.spinnerService.hide();
        if (this.currentSiteIndex === -1) {
          this.currentSiteIndex = 0;
          this.nextSiteIndex = 0;
        }
        this.update();
//        this.currentMetrics = this.dashboardService.currentMetrics[0];
//        this.createGraphData();
      }
    });
    this.carouselInterval = setInterval(() => this.next(true), SLIDE_INTERVAL);
    this.chartInterval = setInterval(() => this.nextChart(true), CHART_INTERVAL);
    this.todayDay = {
      todayDay: moment().format('dddd')
    }
  }

  ngAfterViewInit(): void {
  }

  createGraphData() {
    this.createOptions();
    this.dataLine = {
      labels: this.currentMetrics.dataConsumptionChart.labels,
      datasets: [ {data: this.currentMetrics.dataConsumptionChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([38, 198, 218]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
    this.dataBar = {
      labels: this.currentMetrics.dataDeliveredChart.labels,
      datasets: [ {data: this.currentMetrics.dataDeliveredChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([38, 198, 218]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
  }


createOptions() {
    this.optionsLine = {
      legend: { display: false },
      responsive: true,
      aspectRatio: 2,
      animation: {
        duration: 0, easing: 'linear'
      },
      scales: {
        xAxes: [{
          type: 'category',
          labels: this.currentMetrics.dataConsumptionChart.labels
        }],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
          }
        ]
      },
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
              backgroundColor: this.rgba([38, 198, 218], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (tooltipItem.datasetIndex) {
              case 0:
                return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
            }
          },
          title: (tooltipItems, data) => {
//            const firstDate = data.labels[0];
            const currentDate = data.labels[tooltipItems[0].index];

            return currentDate;// +
  //            ' - ' + moment.duration(moment(currentDate).diff(firstDate)).format('h[h]mm[m]', { trim: false });
          }
        }
      },
      hover: {
        mode: 'index',
        intersect: false
      },
    };
    this.optionsBar = JSON.parse(JSON.stringify(this.optionsLine));
    this.optionsBar.scales.xAxes[0].labels = this.currentMetrics.dataDeliveredChart.labels;
  }

  formatLineColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 0.6),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      borderWidth: 2,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff'
    };
  }

  rgba(colour: Array<number>, alpha: number): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
  }

  slideChangeAnimationReloadEnd(event: AnimationEvent) {
    if (this.beforeChange) {
      this.beforeChange = false;
      this.update();
      this.chartInterval = setInterval(() => this.nextChart(true), CHART_INTERVAL);
      this.afterChange = true;
      ;
    }
  }

  slideChangeAnimationDone(event: AnimationEvent) {
    if (this.afterChange) {
      this.afterChange = false;
    }
  }

  pauseSlide() {
    if (this.isCarouselPaused) {
      this.carouselInterval = setInterval(() => this.next(true), SLIDE_INTERVAL);
      this.chartInterval = setInterval(() => this.nextChart(true), CHART_INTERVAL);
    } else {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
      clearInterval(this.chartInterval);
      this.chartInterval = null;
    }
    this.isCarouselPaused = !this.isCarouselPaused;
  }

  changeSite(direction) {
    if (direction === 'next') {
      this.next(false);
    } else {
      this.prev(false);
    }
  }

  next(triggerAnimation: boolean) {
    this.rotateSite(1, triggerAnimation);
  }

  prev(triggerAnimation: boolean) {
    this.rotateSite(-1, triggerAnimation);
  }

  nextChart(triggerAnimation: boolean) {
    let indexRealtime = this.buttonsRealtimeChart.findIndex((button) => button.name === this.chartRealtimeActiveButton);
    if (indexRealtime === this.buttonsRealtimeChart.length - 1) {
      indexRealtime = 0;
    } else {
      indexRealtime += 1;
    }
    this.chartRealtimeChange(this.buttonsRealtimeChart[indexRealtime].name);
    let indexStatistics = this.buttonsStatisticsChart.findIndex((button) => button.name === this.chartStatisticsActiveButton);
    if (indexStatistics === this.buttonsStatisticsChart.length - 1) {
      indexStatistics = 0;
    } else {
      indexStatistics += 1;
    }
    this.chartStatisticsChange(this.buttonsStatisticsChart[indexStatistics].name);
  }

  /**
   *
   * rotate the data for the next or previous site
   * @param {*} direction: +1 for next, -1 for previous
   * @param {*} triggerAnimation: if ture then boolean are changed in order to trigger animation
   * @memberof DashboardComponent
   */
  rotateSite(direction, triggerAnimation: boolean) {
    clearInterval(this.chartInterval);
    this.chartInterval = null;
    this.chartStatisticsActiveButton = this.buttonsStatisticsChart[0].name;
    this.chartRealtimeActiveButton = this.buttonsRealtimeChart[0].name;
    if (triggerAnimation) {
      this.beforeChange = true;
    }
    // calculate index
    this.nextSiteIndex = this.currentSiteIndex + direction;
    if (this.nextSiteIndex  >= this.dashboardService.currentMetrics.length) {
      this.nextSiteIndex = 0;
    } else if (this.nextSiteIndex  < 0) {
      this.nextSiteIndex = this.dashboardService.currentMetrics.length - 1;
    }
    if (!triggerAnimation) {
      // Update current site
      this.update();
//      this.chartInterval = setInterval(() => this.nextChart(true), CHART_INTERVAL);
    }
  }

  calculateTrends() {
    // Update consumption trending
    // tslint:disable-next-line:max-line-length
    this.trendingConsumptionValue = Math.round((this.currentMetrics.totalConsumption / this.currentMetrics.trends.totalConsumption.avg) * 120 % 60);
    this.trendingConsumptionValue = (this.currentMetrics.totalConsumption < this.currentMetrics.trends.totalConsumption.avg ?
                    this.trendingConsumptionValue : this.trendingConsumptionValue * -1)
    this.trendingConsumption = `scale(0.6,0.6) rotate(${this.trendingConsumptionValue}deg)`;
    // Update inactivty trending
    // tslint:disable-next-line:max-line-length
    this.trendingInactivityValue = Math.round((this.currentMetrics.currentTotalInactivitySecs / this.currentMetrics.trends.inactivity.avg) * 120 % 60);
    this.trendingInactivityValue = (this.currentMetrics.currentTotalInactivitySecs < this.currentMetrics.trends.inactivity.avg ?
                    this.trendingInactivityValue : this.trendingInactivityValue * -1)
    this.trendingInactivity = `scale(0.6,0.6) rotate(${this.trendingInactivityValue}deg)`;
  }

  update() {
    this.currentSiteIndex = this.nextSiteIndex;
    this.currentMetrics = this.dashboardService.currentMetrics[this.currentSiteIndex];
    this.createGraphData();
    this.calculateTrends();
    this.chartStatisticsChange(this.chartStatisticsActiveButton);
    this.chartRealtimeChange(this.chartRealtimeActiveButton);
    this.todayDay = {
      todayDay: moment().format('dddd')
    }
  }

  chartStatisticsChange(buttonName: string) {
    this.chartStatisticsActiveButton = buttonName;
    this.currentMetrics = this.dashboardService.getStatistics(buttonName, this.currentMetrics);
    this.createGraphData();
  }

  chartRealtimeChange(buttonName: string) {
    this.chartRealtimeActiveButton = buttonName;
    this.currentMetrics = this.dashboardService.getRealtime(buttonName, this.currentMetrics);
    this.createGraphData();
  }

}
