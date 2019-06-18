import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableFilterDef } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization-service';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-filter';
import { SiteAreasTableFilter } from '../../../shared/table/filters/site-area-filter';
import { SitesTableFilter } from '../../../shared/table/filters/site-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-filter';
import { ChartData, SimpleChart } from '../shared/chart-utilities';
import { StatisticsBuildService } from '../shared/statistics-build.service';

@Component({
  selector: 'app-statistics-usage',
  templateUrl: './statistics-usage.component.html'
})

export class StatisticsUsageComponent implements OnInit {
  public totalUsage = 0;
  public selectedChart: string;
  public selectedCategory: string;
  public selectedYear: number;
  public allYears = true;
  public allFiltersDef: TableFilterDef[] = [];
  public isAdmin: boolean;

  public chartsInitialized = false;

  @ViewChild('usageBarChart', { static: true }) ctxBarChart: ElementRef;
  @ViewChild('usagePieChart', { static: true }) ctxPieChart: ElementRef;

  private filterParams = {};
  private barChart: SimpleChart;
  private pieChart: SimpleChart;
  private barChartData: ChartData;
  private pieChartData: ChartData;

  constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private spinnerService: SpinnerService,
    private statisticsBuildService: StatisticsBuildService) {
    // Admin?
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
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

  getChartLabel(): string {
    let mainLabel: string;

    if (!this.selectedChart || !this.selectedCategory) {
      // selection not yet defined:
      return ' ';
    }

    if (this.selectedChart === 'month') {
      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.usage_per_cs_month_title',
          { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
      } else {
        mainLabel = this.translateService.instant('statistics.usage_per_user_month_title',
          { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
      }
    } else {
      if (this.selectedCategory === 'C') {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.usage_per_cs_year_title',
            { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
        } else {
          mainLabel = this.translateService.instant('statistics.usage_per_cs_total_title',
            { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
        }
      } else {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.usage_per_user_year_title',
            { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
        } else {
          mainLabel = this.translateService.instant('statistics.usage_per_user_total_title',
            { 'total': Math.round(this.totalUsage).toLocaleString(this.localeService.language) });
        }
      }
    }

    return mainLabel;
  }

  chartChanged(chartName) {
    this.selectedChart = chartName;

    if (this.selectedChart === 'month') {
      this.barChartData = this.barChart.cloneChartData(this.barChartData);
      this.barChart.updateChart(this.barChartData, this.getChartLabel());
    } else {
      this.pieChartData = this.pieChart.cloneChartData(this.pieChartData);
      this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
    }
  }

  categoryChanged(category) {
    this.selectedCategory = category;
  }

  yearChanged(year) {
    this.selectedYear = year;
  }

  filtersChanged(filterParams) {
    this.filterParams = filterParams;
  }

  initCharts() {
    const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
    const labelYAxis: string = this.translateService.instant('statistics.graphic_title_usage_y_axis');
    const toolTipUnit: string = this.translateService.instant('statistics.hours');

    this.barChart = new SimpleChart(this.localeService.language, 'stackedBar',
      this.getChartLabel(), labelXAxis, labelYAxis, toolTipUnit, true);
    this.barChart.initChart(this.ctxBarChart);

    this.pieChart = new SimpleChart(this.localeService.language, 'pie',
      this.getChartLabel(), undefined, undefined, toolTipUnit, true);
    this.pieChart.initChart(this.ctxPieChart);

    this.chartsInitialized = true;
  }

  buildCharts() {
    this.spinnerService.show();

    if (this.selectedCategory === 'C') {
      this.centralServerService.getChargingStationUsageStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 1);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);
          this.totalUsage = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

          if (this.selectedChart === 'month') {
            this.barChart.updateChart(this.barChartData, this.getChartLabel());
          } else {
            this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
          }

          this.spinnerService.hide();
        });
    } else {
      this.centralServerService.getUserUsageStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 1);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);
          this.totalUsage = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

          if (this.selectedChart === 'month') {
            this.barChart.updateChart(this.barChartData, this.getChartLabel());
          } else {
            this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
          }

          this.spinnerService.hide();
        });
    }
  }
}
