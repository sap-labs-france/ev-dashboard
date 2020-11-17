import { AnimationEvent, animate, group, query, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { DashboardService } from '../../services/dashboard.service';
import { SpinnerService } from '../../services/spinner.service';
import { AppDecimalPipe } from '../../shared/formatters/app-decimal-pipe';
import { CurrentMetrics } from '../../types/Statistic';
import { CardChartComponent, ChartButton, ChartData } from './card-chart/card-chart.component';

const SLIDE_INTERVAL = 60000;
const REALTIME_INTERVAL = 10000;
const STATISTICS_INTERVAL = 5000;

const FADE_IN_CLASS = 'fade-in';
const FADE_OUT_CLASS = 'fade-out';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  animations: [
    trigger('SlideChangeStart', [ // used for first half of the animation before changing model data
      transition(':enter', []),
      transition('false => true', [
        group([
          query('.slide-card-up', [ // Used for title to move it up and and down when it changes
            group([
              animate('1.0s ease-in', style({ transform: 'translateY(-300%)' })),
            ]),
          ], { optional: true }),
          query('.fade-out-text', [ // Slight opacity for static texts
            animate('1.0s ease', style({ opacity: '0.6' })),
          ], { optional: true }),
          query('.fade-in', [ // Complete fade-in-out for dynamic texts (keyfigure values, charts and gauges)
            animate('1.0s ease', style({ opacity: '1' })),
          ], { optional: true }),
          query('.fade-out', [
            animate('1.0s ease', style({ opacity: '0' })),
          ], { optional: true }),
        ]),
      ]),
    ]),

    trigger('SlideChangeDone', [ // used for last half of the animation after changing model data
      transition('false => true', [
        group([
          query('.slide-card-up, .fade-out-text', [
            group([
              animate('1.0s ease', style({ opacity: '1' })),
              animate('1.0s ease', style({ transform: 'translateY(0%)' })),
            ]),
          ], { optional: true }),
          query('.fade-in', [
            animate('1.0s ease', style({ opacity: '1' })),
          ], { optional: true }),
          query('.fade-out', [
            animate('1.0s ease', style({ opacity: '0' })),
          ], { optional: true }),
        ]),
      ]),
    ]),
  ],
})

export class DashboardComponent implements OnInit, OnDestroy {

  /**
   * Set to true to trigger the first half of the animation before changing model data
   *
   * @memberof DashboardComponent
   */
  public beforeChange = false;
  /**
   * Set  to true after model data was changed to trigger teh second half of the animation
   *
   * @memberof DashboardComponent
   */
  public afterChange = false;
  public isCarouselPaused = false;
  /**
   * Reference to the set interval
   *
   * @memberof DashboardComponent
   */
  public carouselInterval;
  /**
   * Keep track of teh next site index in order during the animation to update the data model accordingly
   *
   * @memberof DashboardComponent
   */
  public nextSiteIndex = -1;
  public currentSiteIndex = -1;

  public buttonsStatisticsChart = [
    { name: 'day', title: 'dashboard.statistics.button.day' },
    { name: 'week', title: 'dashboard.statistics.button.week' },
    { name: 'month', title: 'dashboard.statistics.button.month' },
    { name: 'year', title: 'dashboard.statistics.button.year' },
  ];
  public chartStatisticsFooter;
  @ViewChild('statisticsChart') public statisticsChartComponent: CardChartComponent;
  public buttonsRealtimeChart = [
    { name: 'consumption', title: 'dashboard.realtime.button.consumption' },
    { name: 'utilization', title: 'dashboard.realtime.button.utilization' },
  ];
  public chartRealtimeFooter;
  @ViewChild('realtimeChart') public realtimeChartComponent: CardChartComponent;

  public dynamicFadeInOutClass = FADE_IN_CLASS;

  public todayDay: any;

  /**
   * Current Metrics retrieved from dashboard service
   *
   * @type {SiteCurrentMetrics}
   * @memberof DashboardComponent
   */
  public currentMetrics: CurrentMetrics;

  public realtimeInterval = REALTIME_INTERVAL;
  public statisticsInterval = STATISTICS_INTERVAL;

  constructor(private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dashboardService: DashboardService,
    private decimalPipe: AppDecimalPipe) {
    this.dashboardService.startLoading();
  }

  public ngOnInit(): void {
    this.spinnerService.show();
    // Special initialization sequence
    this.dashboardService.initialLoadDone.subscribe((isDone) => {
      if (isDone) {
        // Get first site
        this.spinnerService.hide();
        if (this.currentSiteIndex === -1) {
          this.currentSiteIndex = 0;
          this.nextSiteIndex = 0;
        }
        this.update();
        setTimeout(() => { // need to be delayed to ensure that component are created
          this.realtimeChartComponent.startRotation(this.buttonsRealtimeChart[0]);
          this.statisticsChartComponent.startRotation(this.buttonsStatisticsChart[0]);
        }, 200);
      }
    });
    // Handle data update
    this.dashboardService.refreshData.subscribe((metrics) => {
      this.update();
    });
    // Start carousel
    this.carouselInterval = setInterval(() => this.next(true), SLIDE_INTERVAL);
    this.todayDay = {
      todayDay: moment().format('dddd'),
    };
  }

  public ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
    this.isCarouselPaused = true;
    this.dashboardService.stopLoading();
  }

  /**
   * End of first animation part
   *
   * @param {AnimationEvent} event
   * @memberof DashboardComponent
   */
  public slideChangeAnimationReloadEnd(event: AnimationEvent) {
    if (this.beforeChange) {
      this.dynamicFadeInOutClass = FADE_IN_CLASS;
      this.update();
      // Set chart to first button
      this.realtimeChartComponent.nextChart(this.buttonsRealtimeChart[0].name);
      this.statisticsChartComponent.nextChart(this.buttonsStatisticsChart[0].name);
      this.beforeChange = false;
      this.afterChange = true;

    }
  }

  /**
   * End of second part of animation after data model changed
   *
   * @param {AnimationEvent} event
   * @memberof DashboardComponent
   */
  public slideChangeAnimationDone(event: AnimationEvent) {
    if (this.afterChange) {
      // Restart rotation on chart components
      this.realtimeChartComponent.startRotation();
      this.statisticsChartComponent.startRotation();
      this.afterChange = false;
    }
  }

  public pauseSlide() {
    if (this.isCarouselPaused) {
      // Restart slide show
      this.isCarouselPaused = false;
      this.carouselInterval = setInterval(() => this.next(true), SLIDE_INTERVAL);
      this.realtimeChartComponent.startRotation();
      this.statisticsChartComponent.startRotation();
    } else {
      // Pause slide show
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
      this.isCarouselPaused = true;
      this.realtimeChartComponent.pauseRotation();
      this.statisticsChartComponent.pauseRotation();
    }
  }

  public changeSite(direction) {
    if (direction === 'next') {
      this.next(false);
    } else {
      this.prev(false);
    }
  }

  public next(triggerAnimation: boolean) {
    this.rotateSite(1, triggerAnimation);
  }

  public prev(triggerAnimation: boolean) {
    this.rotateSite(-1, triggerAnimation);
  }

  /**
   *
   * rotate the data for the next or previous site
   * @param {*} direction: +1 for next, -1 for previous
   * @param {*} triggerAnimation: if ture then boolean are changed in order to trigger animation
   * @memberof DashboardComponent
   */
  public rotateSite(direction, triggerAnimation: boolean) {
    this.realtimeChartComponent.pauseRotation();
    this.statisticsChartComponent.pauseRotation();

    if (triggerAnimation) {
      this.dynamicFadeInOutClass = FADE_OUT_CLASS;
      this.beforeChange = true;

    }
    // calculate index
    this.nextSiteIndex = this.currentSiteIndex + direction;
    if (this.nextSiteIndex >= this.dashboardService.currentMetrics.length) {
      this.nextSiteIndex = 0;
    } else if (this.nextSiteIndex < 0) {
      this.nextSiteIndex = this.dashboardService.currentMetrics.length - 1;
    }
    if (!triggerAnimation) {
      // Update current site
      this.update();
      if (!this.isCarouselPaused) {
        this.realtimeChartComponent.startRotation(this.buttonsRealtimeChart[0]);
        this.statisticsChartComponent.startRotation(this.buttonsStatisticsChart[0]);
      } else {
        this.realtimeChartComponent.nextChart(this.buttonsRealtimeChart[0].name);
        this.statisticsChartComponent.nextChart(this.buttonsStatisticsChart[0].name);
      }
    }
  }

  public update() {
    this.currentSiteIndex = this.nextSiteIndex;
    this.currentMetrics = this.dashboardService.currentMetrics[this.currentSiteIndex];
    // Update charts
    for (const button of this.buttonsRealtimeChart) {
      this.setRealtimeChartData(button);
    }
    if (this.realtimeChartComponent) {
      this.realtimeChartComponent.setData(this.buttonsRealtimeChart);
    } else {
      setTimeout(() => {
        if (this.realtimeChartComponent) {
          this.realtimeChartComponent.setData(this.buttonsRealtimeChart);
        }
      }, 200);
    }
    for (const button of this.buttonsStatisticsChart) {
      this.setStatisticsChartData(button);
    }
    if (this.statisticsChartComponent) {
      this.statisticsChartComponent.setData(this.buttonsStatisticsChart);
    } else {
      setTimeout(() => {
        if (this.statisticsChartComponent) {
          this.statisticsChartComponent.setData(this.buttonsStatisticsChart);
        }
      }, 200);
    }
    this.todayDay = {
      todayDay: moment().format('dddd'),
    };
  }

  public createRealtimeGraphData(chartData) {
    return {
      options: this.createRealtimeOptions(chartData),
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.series[0],
          yAxisID: 'power',
          ...this.formatLineColor([38, 198, 218]),
          label: this.translateService.instant('transactions.graph.power'),
        }],
      },
    };
  }

  public createRealtimeOptions(target: any) {
    const optionsLine = {
      legend: { display: false },
      responsive: true,
      aspectRatio: 2,
      animation: {
        duration: 0, easing: 'linear',
      },
      scales: {
        xAxes: [{
          type: 'category',
          labels: target.labels,
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            fontColor: '#0d47a1',
          },
        }],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              fontColor: '#0d47a1',
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
        ],
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
              backgroundColor: this.rgba([38, 198, 218], 1),
            };
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (tooltipItem.datasetIndex) {
              case 0:
                return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
            }
          },
          title: (tooltipItems, data) => {
            const currentDate = data.labels[tooltipItems[0].index];

            return currentDate;
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    };
    target.options = optionsLine;
    return optionsLine;
  }

  public setRealtimeChartData(event: ChartButton) {
    const nextRealtimeChart = this.dashboardService.getRealtime(event.name, this.currentMetrics);
    if (!nextRealtimeChart) {
      return;
    }
    const dataDefinition = this.createRealtimeGraphData(nextRealtimeChart.dataConsumptionChart);
    event.chart = {
      data: dataDefinition.data as ChartData,
      options: dataDefinition.options,
    };
  }

  public createStatisticsGraphData(chartData) {
    return {
      options: this.createStatisticsOptions(chartData),
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.series[0],
          yAxisID: 'power',
          ...this.formatLineColor([38, 198, 218]),
          label: this.translateService.instant('transactions.graph.power'),
        }],
      },
    };
  }

  public createStatisticsOptions(target: any) {
    const optionsLine = {
      legend: { display: false },
      responsive: true,
      aspectRatio: 2,
      animation: {
        duration: 0, easing: 'linear',
      },
      scales: {
        xAxes: [{
          type: 'category',
          labels: target.labels,
          gridLines: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            fontColor: '#0d47a1',
          },
        }],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
              fontColor: '#0d47a1',
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
        ],
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
              backgroundColor: this.rgba([38, 198, 218], 1),
            };
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (tooltipItem.datasetIndex) {
              case 0:
                return ' ' + this.decimalPipe.transform(value, '2.2-2') + 'kW';
            }
          },
          title: (tooltipItems, data) => {
            const currentDate = data.labels[tooltipItems[0].index];

            return currentDate;
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    };
    target.options = optionsLine;
    return optionsLine;
  }

  public setStatisticsChartData(event: ChartButton) {
    const nextRealtimeChart = this.dashboardService.getStatistics(event.name, this.currentMetrics);
    if (!nextRealtimeChart) {
      return;
    }
    const dataDefinition = this.createStatisticsGraphData(nextRealtimeChart.dataDeliveredChart);
    event.chart = {
      data: dataDefinition.data as ChartData,
      options: dataDefinition.options,
    };
  }

  public formatLineColor(colors: number[]): any {
    return {
      backgroundColor: this.rgba(colors, 0.6),
      borderColor: this.rgba(colors, 1),
      pointRadius: 0,
      borderWidth: 2,
      pointHoverBackgroundColor: this.rgba(colors, 1),
      pointHoverBorderColor: '#fff',
    };
  }

  public rgba(colour: number[], alpha: number): string {
    return 'rgba(' + colour.concat(alpha).join(',') + ')';
  }
}
