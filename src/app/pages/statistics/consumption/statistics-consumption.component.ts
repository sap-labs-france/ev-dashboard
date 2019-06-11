import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthorizationService } from '../../../services/authorization-service';
import { CentralServerService } from '../../../services/central-server.service';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { TableFilterDef } from '../../../common.types';
import { SitesTableFilter } from '../../../shared/table/filters/site-filter';
import { SiteAreasTableFilter } from '../../../shared/table/filters/site-area-filter';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-filter';
import { StatisticsBuildService } from '../shared/statistics-build.service';
import { ChartData, SimpleChart } from '../shared/chart-utilities';

@Component({
  selector: 'app-statistics-consumption',
  templateUrl: './statistics-consumption.component.html'
})

export class StatisticsConsumptionComponent implements OnInit {
  private chartTitle: string;
  private totalConsumption = 0;
  private selectedChart: string;
  private selectedCategory: string;
  private selectedYear: number;
  private allFiltersDef: TableFilterDef[] = [];
  private isAdmin: boolean;

  private filterParams = {};

  private chartsInitialized = false;
  private barChart: SimpleChart;
  private pieChart: SimpleChart;
  private barChartData: ChartData;
  private pieChartData: ChartData;


  private chartSelectorButtons = [
    { name: 'month', title: 'statistics.graphic_title_month_x_axis' },
    { name: 'year', title: 'statistics.transactions_years' },
  ];

  @ViewChild('consumptionBarChart', { static: true }) ctxBarChart: ElementRef;
  @ViewChild('consumptionPieChart', { static: true }) ctxPieChart: ElementRef;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private spinnerService: SpinnerService,
    private statisticsBuildService: StatisticsBuildService) {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin();
  }

  ngOnInit(): void {
    let filterDef: TableFilterDef;
    filterDef = new SitesTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new SiteAreasTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new ChargerTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    // User filter is only for admin user
    if (this.isAdmin) {
      filterDef = new UserTableFilter().getFilterDef();
      this.allFiltersDef.push(filterDef);
    }

    this.initCharts();
  }

  chartChanged(chartName) {
    let mainLabel: string;

    this.selectedChart = chartName;

    if (this.selectedChart === 'month') {
      mainLabel = this.translateService.instant('statistics.consumption_per_cs_month_title');
      this.barChartData = this.barChart.cloneChartData(this.barChartData);
      this.barChart.updateChart(this.barChartData, mainLabel);
    } else {
      mainLabel = this.translateService.instant('statistics.consumption_per_cs_year_title');
      this.pieChartData = this.pieChart.cloneChartData(this.pieChartData);
      this.pieChart.updateChart(this.pieChartData, mainLabel);
    }
  }

  categoryChanged(category) {
    this.selectedCategory = category;
  }

  yearChanged(year) {
    this.selectedYear = year;
    this.chartTitle = this.translateService.instant('statistics.total_consumption_year', { 'year': this.selectedYear });
  }

  filtersChanged(filterParams) {
    this.filterParams = filterParams;
  }

  initCharts() {
    let mainLabel: string = this.translateService.instant('statistics.consumption_per_cs_month_title');
    const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
    const labelYAxis: string = this.translateService.instant('statistics.graphic_title_consumption_y_axis');
    const toolTipUnit: string = this.translateService.instant('statistics.charger_kw_h');

    this.barChart = new SimpleChart(this.localeService.language, 'stackedBar', mainLabel, labelXAxis, labelYAxis, toolTipUnit, true);
    this.barChart.initChart(this.ctxBarChart);

    mainLabel = this.translateService.instant('statistics.consumption_per_cs_year_title');
    this.pieChart = new SimpleChart(this.localeService.language, 'pie', mainLabel, undefined, undefined, toolTipUnit, true);
    this.pieChart.initChart(this.ctxPieChart);

    this.chartsInitialized = true;
  }

  buildCharts() {
    let mainLabel: string;

    this.spinnerService.show();

    if (this.selectedCategory === 'C') {
      this.centralServerService.getChargingStationConsumptionStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 1);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);

          this.totalConsumption = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

          if (this.selectedChart === 'month') {
            mainLabel = this.translateService.instant('statistics.consumption_per_cs_month_title');
            this.barChart.updateChart(this.barChartData, mainLabel);
          } else {
            mainLabel = this.translateService.instant('statistics.consumption_per_cs_year_title');
            this.pieChart.updateChart(this.pieChartData, mainLabel);
          }

          this.spinnerService.hide();
        })
    } else {
      this.centralServerService.getUserConsumptionStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 1);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);

          this.totalConsumption = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

          if (this.selectedChart === 'month') {
            mainLabel = this.translateService.instant('statistics.consumption_per_user_month_title');
            this.barChart.updateChart(this.barChartData, mainLabel);
          } else {
            mainLabel = this.translateService.instant('statistics.consumption_per_user_year_title');
            this.pieChart.updateChart(this.pieChartData, mainLabel);
          }

          this.spinnerService.hide();
        })
    }
  }
}
