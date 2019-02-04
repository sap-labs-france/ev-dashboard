import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { RadialGaugeComponent } from 'app/shared/component/gauge/radial-gauge';
import { TranslateService } from '@ngx-translate/core';
import * as CanvasGauges from 'canvas-gauges';
import { animate, state, style, transition, trigger, AnimationEvent, query, group, sequence } from '@angular/animations';
import { DashboardService } from '../../services/dashboard.service';

const SLIDE_INTERVAL = 10000;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.scss'],
  animations: [
    trigger('CardRotate', [
      transition(':enter', []),
      transition('false => true', [
/*        query('.next-flipping-card', [
          style({opacity: '0', transform: 'rotateY(180deg)'})
        ]),*/
        group([
          query('.rotate-card, .card-icon', [
//              animate('4.0s ease-in', style({ opacity: '0.05' })),
//              animate('5s ease', style({ transform: 'rotateY(360deg)' }))
          ], { optional: true }),
/*          query('.next-flipping-card', [
            group([
              animate('4.0s ease-in', style({ opacity: '1' })),
              animate('4.0s ease-in', style({ transform: 'rotateY(0deg)' }))
            ])
          ], { optional: true }),*/
        ])
      ]),
      transition('true => false', [
/*        query('.next-flipping-card', [
          style({position: 'absolute', top: '0px', left: '0px', opacity: '0', transform: 'rotateY(180deg)'})
        ]),
        query('.flipping-card', [
          style({position: 'absolute', top: '0px', left: '0px', opacity: '1'})
        ], { optional: true }),*/
      ])
    ]),
    trigger('SlideChangeStart', [
      transition(':enter', []),
      transition('false => true', [
/*        query('.next-flipping-card', [
          style({opacity: '0', transform: 'rotateY(180deg)'})
        ]),*/
        group([
          query('.flipping-card', [
            group([
              animate('1.0s ease', style({ opacity: '0.05' })),
              animate('1.0s ease-in', style({ transform: 'translateY(-300%)' }))
            ])
          ], { optional: true }),
          query('.fade-card', [
            style({ 'margin-left': '0%', width: '100%'}),
            animate('1.0s ease-in', style({transform: 'translateX(200%)'})), //margin-left': '100%', width: '300%' })),
//              animate('4.0s ease-in', style({ transform: 'rotateY(360deg)' }))
        ], { optional: true }),
        query('.fade-card-left', [
          style({ 'margin-right': '0%', width: '100%'}),
          animate('1.0s ease-in', style({transform: 'translateX(-200%)'})),//'margin-right': '100%', background: 'blue', width: '300%' })),
//              animate('4.0s ease-in', style({ transform: 'rotateY(360deg)' }))
      ], { optional: true }),
          query('.fade-header', [
              animate('1.0s ease', style({ opacity: '0.6' })),
//              animate('4.0s ease-in', style({ transform: 'rotateY(360deg)' }))
          ], { optional: true }),
/*          query('.next-flipping-card', [
            group([
              animate('4.0s ease-in', style({ opacity: '1' })),
              animate('4.0s ease-in', style({ transform: 'rotateY(0deg)' }))
            ])
          ], { optional: true }),*/
        ])
      ]),
      transition('true => false', [
/*        query('.next-flipping-card', [
          style({position: 'absolute', top: '0px', left: '0px', opacity: '0', transform: 'rotateY(180deg)'})
        ]),
        query('.flipping-card', [
          style({position: 'absolute', top: '0px', left: '0px', opacity: '1'})
        ], { optional: true }),*/
      ])
    ]),

    trigger('SlideChangeDone', [
      transition(':enter', [
/*        query('.next-flipping-card', [
          style({position: 'absolute', top: '0px', left: '0px', opacity: '1'})
       ])*/
      ]),
      transition('false => true', [
        group([
          query('.flipping-card, .fade-header', [
//            style({ transform: 'rotateY(180deg)' }),
            group([
              animate('1.0s ease', style({ opacity: '1' })),
              animate('1.0s ease-out', style({ transform: 'translateY(0%)' }))
            ])
          ], { optional: true }),
          query('.fade-card', [
            //            style({ transform: 'rotateY(180deg)' }),
//            style({ 'margin-left': '100%', width: '300%'}),
            animate('1.0s ease-out', style({transform: 'translateX(0%)'})),//'margin-left': '0%', width: '100%' })),
//              animate('1.0s ease', style({ opacity: '1' })),
            //              animate('4.0s ease-out', style({ transform: 'rotateY(0deg)' }))
            ], { optional: true }),
            query('.fade-card-left', [
              animate('1.0s ease-out', style({transform: 'translateX(0%)'})),//'margin-right': '0%', width: '100%' })),
    //              animate('4.0s ease-in', style({ transform: 'rotateY(360deg)' }))
          ], { optional: true }),
/*          query('.card-icon', [
            animate('3.0s ease-in', style({ transform: 'translateX(0%)' })),
          ], { optional: true }),*/
/*          query('.card-category, .card-title', [
            animate('3.0s ease-out', style({ opacity: '1' }))
          ], { optional: true }),
          query('.gauge-card-body', [
            animate('3.0s ease-in', style({ opacity: '1' }))
          ], { optional: true }),
          query('.ct-chart', [
            animate('3.0s ease-in', style({ opacity: '1' }))
          ], { optional: true }),*/
/*          query('.next-flipping-card', [
            style({position: 'absolute', top: '0px', left: '0px', opacity: '1'})*/
/*            group([
              animate('3.0s ease-in', style({ opacity: '1' })),
              animate('3.0s ease-in', style({ transform: 'rotateY(180deg)' }))
            ])
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
  activeSite;
  activeCompany;
  carouselInterval;
  companys;
  nextCompanyIndex;
  nextSiteIndex;
  comingSite;
  comingCompany;

  optionsLine: any;
  dataLine: any;
  dataLineBlue: any;
  dataBarBlue: any;
  optionsBar: any;
  dataBar: any;

  constructor(private translateService: TranslateService,
    private dashboardService: DashboardService) {
  }

  ngOnInit(): void {
    this.companys = this.dashboardService.companys;

    // Get first site
    this.activeCompany = { company: this.companys[0], index: 0 };
    this.activeSite = { site: this.companys[0].sites[0], index: 0};
    // Initialize next slide
    this.rotateSite(1, true);

    this.carouselInterval = setInterval(() => this.next(), SLIDE_INTERVAL);
    this.createGraphData();
  }

  ngAfterViewInit(): void {
    this.updateCharts();
  }
  createGraphData() {
    this.createOptions();
    const labelsLine = this.activeSite.site.dataConsumptionChart.labels;
    this.dataLine = {
      labels: this.activeSite.site.dataConsumptionChart.labels,
      datasets: [ {data: this.activeSite.site.dataConsumptionChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([255,255,255]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
    this.dataLineBlue = {
      labels: this.activeSite.site.dataConsumptionChart.labels,
      datasets: [ {data: this.activeSite.site.dataConsumptionChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([38,198,218]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
    this.dataBar = {
      labels: this.activeSite.site.dataDeliveredChart.labels,
      datasets: [ {data: this.activeSite.site.dataDeliveredChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([255,255,255]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
    this.dataBarBlue = {
      labels: this.activeSite.site.dataDeliveredChart.labels,
      datasets: [ {data: this.activeSite.site.dataDeliveredChart.series[0],
        yAxisID: 'power',
        ...this.formatLineColor([38,198,218]),
        label: this.translateService.instant('transactions.graph.power')}]
    };
  }


createOptions() {
    this.optionsLine = {
      legend: { display: false },
      responsive: true,
      aspectRatio: 2,
      scales: {
        xAxes: [{
          type: 'category',
          labels: this.activeSite.site.dataConsumptionChart.labels
        }],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
          }
        ]
      }
/*      tooltips: {
        bodySpacing: 5,
        mode: 'index',
        position: 'nearest',
        multiKeyBackground: 'rgba(0,0,0,0)',
        intersect: false,
        callbacks: {
          labelColor: (tooltipItem, chart) => {
            return {
              borderColor: 'rgba(255,255,255,0)',
//              backgroundColor: this.rgba(this.colors[tooltipItem.datasetIndex], 1)
            }
          },
          label: (tooltipItem, values) => {
            const value = values.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            switch (tooltipItem.datasetIndex) {
              case 0:
//                return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kW';
              case 1:
//                return ' ' + this.decimalPipe.transform(value / 1000, '2.2-2') + 'kWh';
              case 2:
                return ` ${value}%`;
            }
          },
          title: (tooltipItems, data) => {
            const firstDate = data.labels[0];
            const currentDate = data.labels[tooltipItems[0].index];

//            return this.datePipe.transform(currentDate, this.localeService.getCurrentFullLocaleForJS(), 'time') +
//              ' - ' + moment.duration(moment(currentDate).diff(firstDate)).format('h[h]mm[m]', { trim: false });
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
            time: {
              tooltipFormat: 'h:mm a',
            }
          }
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            ticks: {
//              callback: (value, index, values) => this.decimalPipe.transform(value / 1000)
            }
          }
        ]
      },
      pan: {
        enabled: true,
        mode: 'x',
        rangeMin: {
          x: new Date().getTime(),
        },
        rangeMax: {
          x: new Date().getTime() + 3600,
        },
      },
      zoom: {
        enabled: true,
        drag: false,
        mode: 'x',
        sensitivity: 10
      }*/
    };
    this.optionsBar = this.optionsLine;
    this.optionsBar.scales.xAxes[0].labels = this.activeSite.site.dataDeliveredChart.labels;
/*    if (this.localeService.language === 'fr') {
      options.scales.xAxes[0].time = {
        tooltipFormat: 'HH:mm',
        displayFormats: {
          millisecond: 'HH:mm:ss.SSS',
          second: 'HH:mm:ss',
          minute: 'HH:mm',
          hour: 'HH'
        }
      };
    }*/
  }

  formatLineColor(colors: Array<number>): any {
    return {
      backgroundColor: this.rgba(colors, 0.6),
      borderColor: this.rgba(colors, 1),
      pointRadius: 3,
      borderWidth: 3,
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
      this.activeCompany = { company: this.companys[this.nextCompanyIndex], index: this.nextCompanyIndex };
      this.activeSite = { site: this.companys[this.nextCompanyIndex].sites[this.nextSiteIndex], index: this.nextSiteIndex};
      this.updateCharts();
      this.afterChange = true;
      this.rotateSite(1, true);
    }
  }

  slideChangeAnimationDone(event: AnimationEvent) {
    if (this.afterChange) {
      this.afterChange = false;
      this.rotateSite(1, true);
    }
  }

  pauseSlide() {
    if (this.isCarouselPaused) {
      this.carouselInterval = setInterval(() => this.next(), SLIDE_INTERVAL);
    } else {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
    this.isCarouselPaused = !this.isCarouselPaused;
  }

  changeSite(direction) {
    if (direction === 'next') {
      this.next();
    } else {
      this.prev();
    }
  }

  next() {
    this.rotateSite(1);
  }

  prev() {
    this.rotateSite(-1);
  }

  /**
   *
   * rotate the data for the next or previous site
   * @param {*} direction: +1 for next, -1 for previous
   * @memberof DashboardComponent
   */
  rotateSite(direction, noEvent = false) {
    if (!noEvent) {
      this.beforeChange = true;
    }
    // calculate index
    this.nextSiteIndex = this.activeSite.index + direction;
    this.nextCompanyIndex = this.activeCompany.index;
    if (this.nextSiteIndex >= this.companys[this.activeCompany.index].sites.length) {
      this.nextSiteIndex = 0;
      // check company rotate
      this.nextCompanyIndex += direction;
      if (this.nextCompanyIndex < 0) {
        this.nextCompanyIndex = this.companys.length - 1;
      } else if (this.nextCompanyIndex >= this.companys.length) {
        this.nextCompanyIndex = 0;
      }
    } else if (this.nextSiteIndex < 0) {
      // check company rotate
      this.nextCompanyIndex += direction;
      if (this.nextCompanyIndex < 0) {
        this.nextCompanyIndex = this.companys.length - 1;
      } else if (this.nextCompanyIndex >= this.companys.length) {
        this.nextCompanyIndex = 0;
      }
      this.nextSiteIndex = this.companys[this.nextCompanyIndex].sites.length - 1;
    }
    if (noEvent) {
      this.comingCompany = {company: this.companys[this.nextCompanyIndex], index: this.nextCompanyIndex};
      this.comingSite = {site: this.comingCompany.company.sites[this.nextSiteIndex], index: this.nextSiteIndex} ;
    }
  }

  updateCharts() {
    /* ----------==========     Completed Tasks Chart initialization    ==========---------- */
  /*      const optionsChart = {
          lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0
          }),
          low: 0,
          high: 1000, // creative tim: we recommend you to set the high sa the biggest value + something for a better
          // look
          chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
        };
        const completedTasksChart = new Chartist.Line('#consumption',
          this.activeSite.site.dataConsumptionChart, optionsChart);
        const deliveredChart = new Chartist.Bar('#delivered',
        this.activeSite.site.dataDeliveredChart, optionsChart);*/
        this.createGraphData();
  }

}
