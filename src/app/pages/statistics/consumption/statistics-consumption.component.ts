import {Component, Input, ViewChild, OnInit, ElementRef} from '@angular/core';
import {Chart} from 'chart.js';
import {TranslateService} from '@ngx-translate/core';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-statistics-consumption',
  templateUrl: './statistics-consumption.component.html'
})
export class StatisticsConsumptionComponent implements OnInit {
  chartTitle: string;
  ongoingRefresh = false;
  allYears: number[];
  selectedYear: number;
  myChart: Chart;

  // private data = { [] };

  @ViewChild('myChart') ctx: ElementRef;

  constructor(private translateService: TranslateService) {};

ngOnInit(): void {

  this.allYears =  [2017, 2018, 2019];
  this.selectedYear = 2019;



  this.chartTitle = this.translateService.instant('statistics.total_consumption_year', {year: this.selectedYear}) + ': 37 ' +
  this.translateService.instant('statistics.charger_kw_h');

  const stackData = 'Charger';
  const stackTotal = 'Total';

  let titleFontSize = 12; // to be calculated, from the fontsize of chartTitle
  titleFontSize = 20;
  let minValue = 0; // to be calculated, for example as 1/10 of the biggest total value
  minValue = 1;

  const mainLabel: string = this.translateService.instant('statistics.consumption_per_cs_month_title');
  const totalLabel: string = this.translateService.instant('statistics.total');
  const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
  const labelYAxis: string = this.translateService.instant('statistics.graphic_title_consumption_y_axis');

  this.myChart = new Chart(this.ctx.nativeElement.getContext('2d'), {
    type: 'bar',
    plugins: [ChartDataLabels],
    data: {
        labels: ['January', 'February', 'March', 'April', 'Mai'],
        datasets: [
          { label: 'Charger #1',
            stack: stackData,
            backgroundColor: 'rgba(54, 162, 235, 1)',
            data: [1.3, 3.2, 1.9, 4.7, 0.7],
            borderWidth: 0
          },
          {
            label: 'Charger #2',
            stack: stackData,
            data: [3.2, 4.5, 3.2, 1.4, 2.1],
            backgroundColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 0
        },
        {
          label: 'Charger #3',
          stack: stackData,
          data: [2.1, 1.9, 4.3, 0.1, 1.7],
          backgroundColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 0
        },
        { label: totalLabel,
          stack: stackTotal,
          data: [6.6, 9.6, 9.4, 6.2, 4.5],
          backgroundColor: 'darkgrey',
          borderWidth: 0
        }
      ]},
    options: {
        title: {
           display: true,
           text: mainLabel,
           fontStyle: 'bold',
           fontSize: titleFontSize
        },
        legend: { position: 'bottom' },
        plugins: { datalabels: {
                    color: 'black',
                    display: (context) => context.dataset.data[context.dataIndex] > minValue,
                    font: { weight: 'bold'},
                    formatter: Math.round
                    }
                },
        animation: {
          duration: 2000,
          easing: 'easeOutBounce'
        },
        scales: {
            xAxes: [{
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: labelXAxis,
                  fontStyle: 'bold'} }],
            yAxes: [{
                stacked: true,
                scaleLabel: {
                  display: true,
                  labelString: labelYAxis,
                  fontStyle: 'bold'} }],
            ticks: {
                    beginAtZero: true
                  }
            }
     }
 });

  this.myChart.update();
}

refresh(): void {
  this.chartTitle = this.translateService.instant('statistics.total_consumption_year', {year: this.selectedYear}) + ': 37 ' +
  this.translateService.instant('statistics.charger_kw_h');

  this.myChart.update();
}

toggleHideBarItems(): void {}

}
