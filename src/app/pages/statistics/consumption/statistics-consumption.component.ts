import { Component, Input, ViewChild, OnInit, ElementRef } from '@angular/core';
import { CentralServerService } from '../../../services/central-server.service';
import { Chart, ChartData, ChartOptions, ChartDataSets } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import * as moment from 'moment';
import { KeyValue, Site, SiteArea, Charger, User } from '../../../common.types';
import {AuthorizationService} from '../../../services/authorization-service';
import { SpinnerService } from '../../../services/spinner.service';
import { LocaleService } from '../../../services/locale.service';
import { MatDialog, MatSort, MatDialogConfig } from '@angular/material';
import {TableFilterDef} from '../../../common.types';
import {SitesTableFilter} from '../../../shared/table/filters/site-filter';
import {SiteAreasTableFilter} from '../../../shared/table/filters/site-area-filter';
import {ChargerTableFilter} from '../../../shared/table/filters/charger-filter';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {Constants} from '../../../utils/Constants';

@Component({
  selector: 'app-statistics-consumption',
  templateUrl: './statistics-consumption.component.html'
})

export class StatisticsConsumptionComponent implements OnInit {
  public isAdmin: boolean;
  public chartTitle: string;
  public ongoingRefresh = false;
  public transactionYears: number[];
  public selectedCategory = 'C';
  public selectedYear: number;
  public consumptionBarChart: Chart;
  public consumptionPieChart: Chart;

  public tableFiltersDef: TableFilterDef[] = [];
  private filterDef: TableFilterDef;

  private firstSite: Site;
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

  constructor(
    private authorizationService: AuthorizationService,
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog) { };

  ngOnInit(): void {
    this.spinnerService.show();
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();

    this.selectedYear = new Date().getFullYear();

    this.centralServerService.getTransactionYears().subscribe((transactionYears) => {
      this.transactionYears = transactionYears;
      if (this.transactionYears.indexOf(this.selectedYear) < 0) {
        this.transactionYears.push(this.selectedYear);
      }
    });

    this.nameTotalsLabel = this.translateService.instant('statistics.total');
    if (this.nameTotalsLabel === '') { this.nameTotalsLabel = 'Total' }

    this.filterDef = new SitesTableFilter().getFilterDef();
    this.tableFiltersDef.push(this.filterDef);

    this.filterDef = new SiteAreasTableFilter().getFilterDef();
    this.tableFiltersDef.push(this.filterDef);

    this.filterDef = new ChargerTableFilter().getFilterDef();
    this.tableFiltersDef.push(this.filterDef);

    // only for admin user
    if (this.isAdmin) {
      this.filterDef = new UserTableFilter().getFilterDef();
      this.tableFiltersDef.push(this.filterDef);
    }

    this.initChart(this.ctxBar, this.ctxPie);

    this.centralServerService.getSites([])
      .subscribe((sites) => {
        if (sites && sites.result.length > 0) {
          this.firstSite = sites.result[0];
          // only for admin user (to limit results on first select!):
          if (this.isAdmin) {
            this.filterDef = new SitesTableFilter().getFilterDef();
            this.filterDef.currentValue = [{key: this.firstSite.id, value: this.firstSite.name, objectRef: this.firstSite}];
            this.filterChanged(this.filterDef);
          }
        }
        this.buildChart(this.selectedYear);
      });
  }

  public filterChanged(filter: TableFilterDef) {
    // Get Actions def
    // Reset to default paging
    // this.setPaging({
    // skip: 0,
    // limit: this.getPageSize()
    // });

    // Update Filter
    const foundFilter = this.tableFiltersDef.find((filterDef) => {
      return filterDef.id === filter.id;
    });

    // Update value (usually this is not needed!)
    foundFilter.currentValue = filter.currentValue;
  }

  public resetFilters(): void {
    let filterWasChanged = false;

    const oldYear = this.selectedYear;

    this.selectedYear = new Date().getFullYear();
    if (oldYear !== this.selectedYear) {
      filterWasChanged = true;
    }

    if (this.tableFiltersDef) {
      // Reset all filter fields
      this.tableFiltersDef.forEach((filterDef: TableFilterDef) => {
        switch (filterDef.type) {
          case 'dropdown':
            if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
            filterDef.currentValue = null;
            break;
          case 'dialog-table':
            if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
            filterDef.currentValue = null;
            break;
          case 'date':
            // to be sure:
            filterWasChanged = true;
            filterDef.reset();
            break;
        }
      });
    }

    if (filterWasChanged) {
      this.refresh();
    }
  }

  public resetDialogTableFilter(filterDef: TableFilterDef): void {
    let filterWasChanged = false;

    if (filterDef.type === 'date') {
      // to be sure:
      filterWasChanged = true;
      filterDef.reset();
    } else {
      if (filterDef.currentValue && filterDef.currentValue !== null) { filterWasChanged = true; }
      filterDef.currentValue = null;
    }

    this.filterChanged(filterDef);

    if (filterWasChanged) {
      this.refresh();
    }
  }

  public showDialogTableFilter(filterDef: TableFilterDef): void {
    // Disable outside click close
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    // Set Validate button title to 'Set Filter'
    dialogConfig.data = {
      validateButtonTitle : 'general.set_filter'
    };
    // Render the Dialog Container transparent
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Show
    const dialogRef = this.dialog.open(filterDef.dialogComponent, dialogConfig);
    // Update value
    dialogRef.afterClosed().subscribe(data => {
      let filterWasChanged = false;
      if (data) {
        if (!filterDef.currentValue || filterDef.currentValue !== data) {
          filterWasChanged = true;
          filterDef.currentValue = data;
        };

        this.filterChanged(filterDef);

        if (filterWasChanged) {
          this.refresh();
        }
      }
    });
  }

  public buildFilterValues(): Object {
    const filterJson = {};
    // Parse filters
    if (this.tableFiltersDef) {
      this.tableFiltersDef.forEach((filterDef) => {
        // Check the 'All' value
        if (filterDef.currentValue && filterDef.currentValue !== Constants.FILTER_ALL_KEY) {
          // Date
          if (filterDef.type === 'date') {
            filterJson[filterDef.httpId] = filterDef.currentValue.toISOString();
          // Table
          } else if (filterDef.type === Constants.FILTER_TYPE_DIALOG_TABLE) {
            if (filterDef.currentValue.length > 0) {
              if (filterDef.currentValue[0].key !== Constants.FILTER_ALL_KEY) {
                if (filterDef.currentValue.length > 1) {
                  // Handle multiple key selection as a JSON array
                  const jsonKeys = [];
                  for (let index = 0; index < filterDef.currentValue.length; index++) {
                    jsonKeys.push(filterDef.currentValue[index].key);
                  }
                  filterJson[filterDef.httpId] = JSON.stringify(jsonKeys);
                } else {
                  filterJson[filterDef.httpId] = filterDef.currentValue[0].key;
                }
              }
            }
          // Others
          } else {
            // Set it
            filterJson[filterDef.httpId] = filterDef.currentValue;
          }
        }
      });
    }

    return filterJson;
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
        options: chartOptions,
        data: { labels: [], datasets: [] }
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

  updateBarOptions(mainLabel?: string): void {
    if (mainLabel) {
      this.barChartOptions.title.text = mainLabel;
    }

    let minValue = 0;
    if (Array.isArray(this.barChartData.datasets)) {
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
//      minValue = minValue / amount / 2
      minValue = minValue / 40;
    }

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

  updatePieOptions(mainLabel?: string): void {
    if (mainLabel) {
      this.pieChartOptions.title.text = mainLabel;
    }

    let minValue = 0;
    if (Array.isArray(this.pieChartData.datasets)) {
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
//      minValue = minValue / amount / 2
      minValue = minValue / 40;
    }

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
      let params;

      params = this.buildFilterValues();
      this.chartTitle = this.createChartTitle(selectedYear, this.totalConsumption);


      if (this.selectedCategory === 'C') {
        this.centralServerService.getChargingStationConsumptionStatistics(selectedYear, params)
          .subscribe(statisticsData => {

            this.totalConsumption = this.buildStatistics(statisticsData);
            this.spinnerService.hide();

            resolve('chartDataCreated');
          })
      } else {
        this.centralServerService.getUserConsumptionStatistics(selectedYear, params)
          .subscribe(statisticsData => {

            this.totalConsumption = this.buildStatistics(statisticsData);
            this.spinnerService.hide();

            resolve('chartDataCreated');
          })
      }
    });

    callServerAsPromise.then(() => {
      // 1st problem: options (e.g. for minimum values) cannot be changed for an existing chart (Chart.options is not
      // recognized by compiler, but by browser!) => solved by type 'any' instead of 'Chart'
      // 2nd problem: in Promise processing or in Observable callback, animation is skipped for each new chart
      // => solved by initializing charts before Promise processing
      let anyChart: any;
      let mainLabel: string;

      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.consumption_per_cs_month_title');
      } else {
        mainLabel = this.translateService.instant('statistics.consumption_per_user_month_title');
      }
      this.updateBarOptions(mainLabel);
      anyChart = this.consumptionBarChart;
      anyChart.options = this.barChartOptions;
      this.consumptionBarChart = anyChart;
      this.updateChart(this.consumptionBarChart, this.barChartData);

      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.consumption_per_cs_year_title');
      } else {
        mainLabel = this.translateService.instant('statistics.consumption_per_user_year_title');
      }
      this.updatePieOptions(mainLabel);
      anyChart = this.consumptionPieChart;
      anyChart.options = this.pieChartOptions;
      this.consumptionPieChart = anyChart;
      this.updateChart(this.consumptionPieChart, this.pieChartData);

    });
  }

  createChartTitle(selectedYear: number, totalConsumption: number): string {
    return this.translateService.instant('statistics.total_consumption_year', { 'year': this.selectedYear })

  }

  updateChart(chartName: Chart, chartData: ChartData) {
    chartName.data = chartData;
    if (!chartName.data.labels) {
      chartName.data.labels = [];
    }
    if (!chartName.data.datasets) {
      chartName.data.datasets = [];
    }

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

      // sort bar chart datasets by label name:
      this.barChartData.datasets.sort((obj1, obj2) => {
        if (obj1['label'] < obj2['label']) {
          return -1
        } else {
          if (obj1['label'] > obj2['label']) {
            return 1
          } else {
            return 0
          }
        }
      });

      // now build pie chart from sorted bar chart data:
      if (!this.pieChartData.labels) {
        this.pieChartData.labels = [];
      }

      if (!this.pieChartData.datasets) {
        this.pieChartData.datasets = [];
      }

      this.barChartData.datasets.forEach((obj) => {
        let sum = 0;
        let numberArray = [];
        this.pieChartData.labels.push(obj['label']);
        sum = 0;
        numberArray = obj['data'];
        numberArray.forEach((data) => {
          sum += data;
        })
        if (this.pieChartData.datasets.length === 0) {
          numberArray = [];
          numberArray.push(sum);
          this.pieChartData.datasets.push({ 'data': numberArray });
        } else {
          numberArray = this.pieChartData.datasets[0].data;
          numberArray.push(sum);
          this.pieChartData.datasets[0].data = numberArray;
        }
      });


      // Last bar chart dataset for totals:
      this.barChartData.datasets.push({ 'label': totalLabel, 'data': totalDataArray });

      this.totalConsumption = Math.round(this.totalConsumption);

      // Add data configuration like color information:
      const nameChargerStack = 'Item';

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
//    const colors = [[0, 128, 128, 0.8],
//    [128, 0, 128, 0.8],
//    [255, 255, 0, 0.8],
//    [0, 0, 128, 0.7],
//    [128, 0, 0, 0.7],
//    [255, 0, 255, 0.8],
//    [0, 128, 0, 0.8],
//    [255, 0, 0, 0.8],
//    [0, 255, 0, 0.9],
//    [0, 255, 255, 0.9]
//    ]
    const colors = [[144, 238, 144, 0.8],
      [255, 165, 0, 0.6],
      [135, 206, 235, 0.8],
      [222, 184, 135, 0.6],
      [255, 182, 193, 0.8],
      [102, 205, 170, 0.6],
      [255, 160, 122, 0.8],
      [70, 130, 180, 0.6],
      [255, 222, 173, 0.8],
      [218, 112, 214, 0.6]
    ]


    const div10 = counter % 10;

    //  return 'rgba(75, 192, 192, 1)'
    return `rgba(${colors[div10][0]}, ${colors[div10][1]}, ${colors[div10][2]}, ${colors[div10][3]})`
  }

  categoryChanged(): void {
    this.refresh();
  }

  yearChanged(): void {
    this.refresh();
  }

  refresh(buttonPressed?: false): void {
    if (buttonPressed) { this.ongoingRefresh = true; }
    this.buildChart(this.selectedYear);
    if (buttonPressed) { this.ongoingRefresh = false; }
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
