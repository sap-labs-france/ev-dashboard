import { Component, Input, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CentralServerService } from '../../../services/central-server.service';
import { Chart, ChartData, ChartOptions, ChartDataSets } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import { SpinnerService } from 'app/services/spinner.service';
import { LocaleService } from 'app/services/locale.service';

@Component({
  selector: 'app-statistics-consumption',
  templateUrl: './statistics-consumption.component.html'
})

export class StatisticsConsumptionComponent implements OnInit {
  public chartTitle: string;
  public ongoingRefresh = false;
  public transactionYears: number[];
  public selectedYear: number;
  public consumptionBarChart: any; // Chart; does not know options!
  public consumptionPieChart: any; // Chart;

  private totalConsumption = 0;
  private nameTotalsLabel: string;
  private barChartOptions: ChartOptions;
  private barChartData: ChartData;
  private barChartItemsHidden = false;
  private pieChartOptions: ChartOptions;
  private pieChartData: ChartData;
  private pieChartItemsHidden = false;


  @ViewChild('consumptionBarChart') ctxBar: ElementRef;
  @ViewChild('consumptionPieChart') ctxPie: ElementRef;

  constructor(public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService) { };

  ngOnInit(): void {
    this.spinnerService.show();

    this.selectedYear = new Date().getFullYear();

    // Todo: replace by HTTP request for endpoint '/TransactionYears' (to be added to central-server.service)
    this.transactionYears = [2017, 2018, 2019];

    this.nameTotalsLabel = this.translateService.instant('statistics.total');
    if (this.nameTotalsLabel === '') { this.nameTotalsLabel = 'Total' }

    this.initChart(this.ctxBar, this.ctxPie);

    // could be called in callback for selection of transactionYears:
    this.buildChart(this.selectedYear);
  }


  initChart(contextBar: ElementRef, contextPie: ElementRef): void {

    let mainLabel: string = this.translateService.instant('statistics.consumption_per_cs_month_title');
    const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
    const labelYAxis: string = this.translateService.instant('statistics.graphic_title_consumption_y_axis');

    // Todo: font size for label to be determined from context (HTML)
    this.barChartOptions = this.createBarOptions(mainLabel, 20, labelXAxis, labelYAxis);
    this.consumptionBarChart = this.getChart(contextBar, 'bar', this.barChartOptions);

    mainLabel = this.translateService.instant('statistics.consumption_per_cs_year_title');
    this.pieChartOptions = this.createPieOptions(mainLabel, 20);
    this.consumptionPieChart = this.getChart(contextPie, 'pie', this.pieChartOptions);

  }

  getChart(context: ElementRef, chartType: 'bar' | 'pie', chartOptions: ChartOptions, chartData?: ChartData): Chart {

    if (!chartData) {
      return new Chart(context.nativeElement.getContext('2d'), {
        type: chartType,
        plugins: [ChartDataLabels],
        options: chartOptions
      });
    } else {
      return new Chart(context.nativeElement.getContext('2d'), {
        type: chartType,
        plugins: [ChartDataLabels],
        options: chartOptions,
        data: chartData
      });
    }
  }

  createBarOptions(mainLabel: string, titleFontSize: number, labelXAxis: string, labelYAxis: string): ChartOptions {
    const chartOptions: ChartOptions = {};

    chartOptions['title'] = {
      display: true,
      text: mainLabel,
      fontStyle: 'bold',
      fontSize: titleFontSize
    };

    chartOptions['legend'] = {
      display: false,
      position: 'bottom'
    };

    chartOptions['plugins'] = {};
    chartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        //        let maxValue = 0;
        //        let amount = context.chart.data.datasets.length;
        //        if (amount > 1) { amount -= 1 } else { amount = 1 }
        //        let number;
        //
        //        context.chart.data.datasets.forEach((dataset) => {
        //          if (Array.isArray(dataset.data) === true &&
        //            dataset.label === this.nameTotalsLabel) {
        //            for (let i = 0; i < dataset.data.length; i++) {
        //              number = dataset.data[i];
        //              if (typeof (number) === 'number') {
        //                if (number > maxValue) { maxValue = number }
        //              }
        //            };
        //          }
        //        });
        //        maxValue = maxValue / amount / 2
        //        return context.dataset.data[context.dataIndex] > maxValue
        return context.dataset.data[context.dataIndex] > 0
      },
      //      font: { weight: 'bold' },
      formatter: Math.round
    };

    chartOptions['animation'] = {
      duration: 2000,
      easing: 'easeOutBounce'
    };

    chartOptions['tooltips'] = {
      enabled: true,
      callbacks: {
        label: (tooltipItem, data) => {
          return data.datasets[tooltipItem.datasetIndex].label + ' : ' +
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
        }
      }
    };

    chartOptions['scales'] = {
      xAxes:
        [{
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: labelXAxis,
            fontStyle: 'bold'
          }
        }],
      yAxes:
        [{
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: labelYAxis,
            fontStyle: 'bold'
          },
          ticks: {
            beginAtZero: true,
            callback: (value, index, values) => {
              return value.toLocaleString();
            }
          }
        }]
    }

    return chartOptions;
  }

  updateBarOptions(): void {
    let minValue = 0;
    let amount = this.barChartData.datasets.length;
    if (amount > 1) { amount -= 1 } else { amount = 1 }
    let number;

    this.barChartData.datasets.forEach((dataset) => {
      if (Array.isArray(dataset.data) === true &&
        dataset.label === this.nameTotalsLabel) {
        for (let i = 0; i < dataset.data.length; i++) {
          number = dataset.data[i];
          if (typeof (number) === 'number') {
            if (number > minValue) { minValue = number }
          }
        };
      }
    });
    minValue = minValue / amount / 2

    this.barChartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        return context.dataset.data[context.dataIndex] > minValue
      },
      //      font: { weight: 'bold' },
      formatter: (value, context) => {
        return Math.round(value).toLocaleString();
      }
    };
  }

  createPieOptions(mainLabel: string, titleFontSize: number): ChartOptions {
    const chartOptions: ChartOptions = {};

    chartOptions['title'] = {
      display: true,
      text: mainLabel,
      fontStyle: 'bold',
      fontSize: titleFontSize
    };

    chartOptions['legend'] = {
      display: false,
      position: 'bottom'
    };

    chartOptions['plugins'] = {};
    chartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        //        let maxValue = 0;
        //        let amount = 0;
        //        let number;

        //        context.chart.data.datasets.forEach((dataset) => {
        //          if (Array.isArray(dataset.data) === true) {
        //            for (let i = 0; i < dataset.data.length; i++) {
        //              number = dataset.data[i];
        //              if (typeof (number) === 'number') {
        //                maxValue = maxValue + number;
        //              }
        //            }
        //            amount += dataset.data.length;
        //          }
        //        });
        //        if (amount < 1) { amount = 1 }
        //        maxValue = maxValue / amount / 2
        //        return context.dataset.data[context.dataIndex] > maxValue
        return context.dataset.data[context.dataIndex] > 0
      },
    };

    chartOptions['animation'] = {
      duration: 2000,
      easing: 'easeOutBounce'
    };

    chartOptions['tooltips'] = {
      enabled: true,
      callbacks: {
        label: (tooltipItem, data) => {
          return data.labels[tooltipItem.index] + ' : ' +
            data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
        }
      }
    };

    return chartOptions;
  }

  updatePieOptions(): void {
    let minValue = 0;
    let amount = 0;
    let number;

    this.pieChartData.datasets.forEach((dataset) => {
      if (Array.isArray(dataset.data) === true) {
        for (let i = 0; i < dataset.data.length; i++) {
          number = dataset.data[i];
          if (typeof (number) === 'number') {
            minValue = minValue + number;
          }
        }
        amount += dataset.data.length;
      }
    });
    if (amount < 1) { amount = 1 }
    minValue = minValue / amount / 2

    this.pieChartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        return context.dataset.data[context.dataIndex] > minValue
      },
      //      font: { weight: 'bold' },
      formatter: (value, context) => {
        return Math.round(value).toLocaleString();
      }
    };

  }

  buildChart(selectedYear: number): void {

    this.barChartData = {};
    this.barChartData.labels = [];
    this.barChartData.datasets = [];

    this.totalConsumption = 0;

    const callServerAsPromise = new Promise(resolve => {
      this.centralServerService.getConsumptionStatistics(selectedYear)
        .subscribe(statisticsData => {

          this.totalConsumption = this.buildStatistics(statisticsData);
          this.spinnerService.hide();

          this.chartTitle = this.createChartTitle(selectedYear, this.totalConsumption);

          resolve('chartDataCreated');
        })
    });

    callServerAsPromise.then(() => {
      // 1st problem: options (e.g. for minimum values) cannot be changed for an existing chart (Chart.options is not
      // recognized by compiler, but by browser!) => solved by type 'any' instead of 'Chart'
      // 2nd problem: in Promise processing or in Observable callback, animation is skipped for each new chart
      // => solved by initializing charts before Promise processing

      this.updateBarOptions();
      this.consumptionBarChart.options = this.barChartOptions;
      this.updateChart(this.consumptionBarChart, this.barChartData);
      this.updatePieOptions();
      this.consumptionPieChart.options = this.pieChartOptions;
      this.updateChart(this.consumptionPieChart, this.pieChartData)

    });
  }

  createChartTitle(selectedYear: number, totalConsumption: number): string {
    return this.translateService.instant('statistics.total_consumption_year', { 'year': this.selectedYear })

  }

  updateChart(chartName: Chart, chartData: ChartData) {

    chartName.data = chartData;
    chartName.update({ lazy: true });
  }

  buildStatistics(statisticsData: any): number {
    this.barChartData = {};
    this.pieChartData = {};

    let monthString = '';
    let dataSetIndex = 0;
    let monthIndex = 0;
    let countMonths = 0;
    let totalValue = 0;

    const totalDataArray = [];

    const consumptionValues = statisticsData;
    const totalLabel: string = this.translateService.instant('statistics.total');
    const monthLabel = 'month';


    if (consumptionValues && consumptionValues.length > 0) {
      consumptionValues.forEach((consumptionValue: { [x: string]: number; }) => {

        // for each month (sorted from 0 to 11):
        let totalValuePerMonth = 0;
        let numberArray = [];
        countMonths++;

        monthIndex = consumptionValue[monthLabel];

        monthString = moment().month(monthIndex).format('MMMM');

        if (!this.barChartData.labels) {
          this.barChartData.labels = [];
        }

        if (this.barChartData.labels.indexOf(monthString) < 0) {
          this.barChartData.labels.push(monthString);
        }

        if (!this.barChartData.datasets) {
          this.barChartData.datasets = [];
        }

        if (!this.pieChartData.labels) {
          this.pieChartData.labels = [];
        }

        if (!this.pieChartData.datasets) {
          this.pieChartData.datasets = [];
        }

        // now for all chargers:
        for (const key in consumptionValue) {
          if (key !== monthLabel) {
            // Round
            consumptionValue[key] = Math.round(consumptionValue[key]);

            dataSetIndex = this.barChartData.datasets.findIndex((element) => element['label'] === key);

            if (dataSetIndex < 0) {
              numberArray = [];

              for (let i = 1; i < countMonths; i++) {
                // add leading zeros for previous months without activity
                numberArray.push(0);
              }

              numberArray.push(consumptionValue[key]);
              this.barChartData.datasets.push({ 'label': key, 'data': numberArray });
            } else {
              numberArray = this.barChartData.datasets[dataSetIndex].data;
              numberArray.push(consumptionValue[key]);
              this.barChartData.datasets[dataSetIndex].data = numberArray;
            }


            dataSetIndex = this.pieChartData.labels.findIndex((element) => element === key);

            if (dataSetIndex < 0) {
              this.pieChartData.labels.push(key);

              //            numberArray = [];
              //            numberArray.push(consumptionValue[key]);
              //            this.pieChartData.datasets.push({ 'label': key, 'data': numberArray });
              //          } else {
              //            numberArray = this.pieChartData.datasets[dataSetIndex].data;
              //            numberArray[0] += consumptionValue[key];
              //            this.pieChartData.datasets[dataSetIndex].data = numberArray;
              //          }

              if (this.pieChartData.datasets.length === 0) {
                numberArray = [];
                numberArray.push(consumptionValue[key]);
                this.pieChartData.datasets.push({ 'data': numberArray });
              } else {
                numberArray = this.pieChartData.datasets[0].data;
                numberArray.push(consumptionValue[key]);
                this.pieChartData.datasets[0].data = numberArray;
              }
            } else {
              numberArray = this.pieChartData.datasets[0].data;
              numberArray[dataSetIndex] += consumptionValue[key];
              this.pieChartData.datasets[0].data = numberArray;
            }

            totalValuePerMonth += consumptionValue[key];
          }
        }

        // add trailing zero if no activity in the current month:
        this.barChartData.datasets.forEach((element) => {
          if (element.label !== totalLabel) {
            numberArray = element.data;
            if (numberArray.length < countMonths) {
              for (let i = numberArray.length; i < countMonths; i++) {
                numberArray.push(0);
              }
              element.data = numberArray;
            }
          }
        });

        // Deferred update for totals:
        totalDataArray.push(totalValuePerMonth);

        totalValue += totalValuePerMonth;
      });

      // Last dataset for totals:
      this.barChartData.datasets.push({ 'label': totalLabel, 'data': totalDataArray });

      this.totalConsumption = Math.round(this.totalConsumption);

      // Add data configuration like color information:
      const nameChargerStack = 'Charger';

      this.updateBarDataSets(this.barChartData.datasets, nameChargerStack, this.nameTotalsLabel);
      this.updatePieDataSets(this.pieChartData.datasets);

    }

    return totalValue

  }

  updateBarDataSets(chartDataSets: ChartDataSets[], nameDataStack: string, totalsLabel: string) {
    let countData = 0;

    chartDataSets.forEach((dataset) => {
      if (dataset.label === totalsLabel) {
        dataset.stack = totalsLabel;
        dataset.hidden = false;
        dataset.backgroundColor = 'darkgrey';
        dataset.borderWidth = 0;
      } else {
        dataset.stack = nameDataStack;
        dataset.hidden = false;
        dataset.backgroundColor = this.getColorCode(countData);
        countData++;
        dataset.borderWidth = 0;
      }

    });
  }

  updatePieDataSets(chartDataSets: ChartDataSets[]) {

    chartDataSets.forEach((dataset) => {
      dataset.hidden = false;
      dataset.backgroundColor = [];
      for (let i = 0; i < dataset.data.length; i++) {
        dataset.backgroundColor.push(this.getColorCode(i));
      }

      dataset.borderWidth = 0;
    });
  }

  getColorCode(counter: number) {
    const colors = [[0, 128, 128, 0.8],
    [128, 0, 128, 0.8],
    [255, 255, 0, 0.8],
    [0, 0, 128, 0.7],
    [128, 0, 0, 0.7],
    [255, 0, 255, 0.8],
    [0, 128, 0, 0.8],
    [255, 0, 0, 0.8],
    [0, 255, 0, 0.9],
    [0, 255, 255, 0.9]
    ]

    const div10 = counter % 10;

    //  return 'rgba(75, 192, 192, 1)'
    return `rgba(${colors[div10][0]}, ${colors[div10][1]}, ${colors[div10][2]}, ${colors[div10][3]})`
  }


  setYear(): void {
    this.buildChart(this.selectedYear);
  }

  refresh(): void {
    this.ongoingRefresh = true;
    this.buildChart(this.selectedYear);
    this.ongoingRefresh = false;
  }

  toggleHideBarItems(): void {
    this.barChartData = this.consumptionBarChart.data;

    this.barChartItemsHidden = !this.barChartItemsHidden;

    this.barChartData.datasets.forEach((dataset) => {
      if (dataset.label !== this.nameTotalsLabel) {
        dataset.hidden = this.barChartItemsHidden;
      }
    });

    this.updateChart(this.consumptionBarChart, this.barChartData);
  }

  toggleHidePieItems(): void {
    const meta = this.consumptionPieChart.getDatasetMeta(0);

    this.pieChartItemsHidden = !this.pieChartItemsHidden;

    meta.data.forEach((object) => {
      object.hidden = this.pieChartItemsHidden;
    });
    this.updateChart(this.consumptionPieChart, this.pieChartData);
  }

}
