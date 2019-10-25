import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableFilterDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { ChartData, SimpleChart } from '../shared/chart-utilities';
import { StatisticsBuildService } from '../shared/statistics-build.service';
import { StatisticsExportService } from '../shared/statistics-export.service';

@Component({
  selector: 'app-statistics-transactions',
  templateUrl: './statistics-transactions.component.html',
})

export class StatisticsTransactionsComponent implements OnInit {
  public totalTransactions = 0;
  public selectedChart: string;
  public selectedCategory: string;
  public selectedYear: number;
  public allYears = true;
  public allFiltersDef: TableFilterDef[] = [];
  public chartsInitialized = false;

  @ViewChild('transactionsBarChart', { static: true }) ctxBarChart: ElementRef;
  @ViewChild('transactionsPieChart', { static: true }) ctxPieChart: ElementRef;

  private filterParams: { [param: string]: string | string[]; };
  private barChart: SimpleChart;
  private pieChart: SimpleChart;
  private barChartData: ChartData;
  private pieChartData: ChartData;
  private language: string;

  constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private spinnerService: SpinnerService,
    private statisticsBuildService: StatisticsBuildService,
    private statisticsExportService: StatisticsExportService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
  }

  ngOnInit(): void {
    let filterDef: TableFilterDef;
    filterDef = new SiteTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new SiteAreaTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new ChargerTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new UserTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    this.initCharts();
  }

  scopeChanged(chartName: string): void {
    this.selectedChart = chartName;
  }

  categoryChanged(category: string): void {
    this.selectedCategory = category;
  }

  yearChanged(year: number): void {
    this.selectedYear = year;
  }

  filtersChanged(filterParams: { [param: string]: string | string[]; }): void {
    this.filterParams = filterParams;
  }

  exportData(): void {
    const enhancedFilterParams = this.statisticsExportService.enhanceFilterParams(this.filterParams, 'Transactions',
      this.selectedCategory, this.selectedYear, this.selectedChart);
    this.statisticsExportService.exportDataWithDialog(enhancedFilterParams,
      this.translateService.instant('statistics.dialog.transactions.export.title'),
      this.translateService.instant('statistics.dialog.transactions.export.confirm'));
  }

  getChartLabel(): string {
    let mainLabel: string;

    if (!this.selectedChart || !this.selectedCategory) {
      // selection not yet defined:
      return ' ';
    }

    if (this.selectedChart === 'month') {
      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.transactions_per_cs_month_title',
          { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
      } else {
        mainLabel = this.translateService.instant('statistics.transactions_per_user_month_title',
          { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
      }
    } else {
      if (this.selectedCategory === 'C') {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.transactions_per_cs_year_title',
            { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
        } else {
          mainLabel = this.translateService.instant('statistics.transactions_per_cs_total_title',
            { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
        }
      } else {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.transactions_per_user_year_title',
            { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
        } else {
          mainLabel = this.translateService.instant('statistics.transactions_per_user_total_title',
            { total: Math.round(this.totalTransactions).toLocaleString(this.language) });
        }
      }
    }

    return mainLabel;
  }

  initCharts(): void {
    const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
    const labelYAxis: string = this.translateService.instant('statistics.graphic_title_transactions_y_axis');
    const toolTipUnit = '';

    this.barChart = new SimpleChart(this.language, 'stackedBar',
      this.getChartLabel(), labelXAxis, labelYAxis, toolTipUnit, true);
    this.barChart.initChart(this.ctxBarChart);

    this.pieChart = new SimpleChart(this.language, 'pie',
      this.getChartLabel(), undefined, undefined, toolTipUnit, true);
    this.pieChart.initChart(this.ctxPieChart);

    this.chartsInitialized = true;
  }

  updateCharts(refresh: boolean): void {
    if (refresh) {
      if (this.selectedChart === 'month') {
        this.barChartData = this.barChart.cloneChartData(this.barChartData, true);
        this.barChart.updateChart(this.barChartData, this.getChartLabel());
      } else {
        this.pieChartData = this.pieChart.cloneChartData(this.pieChartData, true);
        this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
      }

      this.buildCharts();
    } else {
      if (this.selectedChart === 'month') {
        this.barChartData = this.barChart.cloneChartData(this.barChartData);
        this.barChart.updateChart(this.barChartData, this.getChartLabel());
      } else {
        this.pieChartData = this.pieChart.cloneChartData(this.pieChartData);
        this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
      }
    }
  }

  buildCharts(): void {
    this.spinnerService.show();

    if (this.selectedCategory === 'C') {
      this.centralServerService.getChargingStationTransactionsStatistics(this.selectedYear, this.filterParams)
        .subscribe((statisticsData) => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 2);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);
          this.totalTransactions = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

          if (this.selectedChart === 'month') {
            this.barChart.updateChart(this.barChartData, this.getChartLabel());
          } else {
            this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
          }

          this.spinnerService.hide();
        });
    } else {
      this.centralServerService.getUserTransactionsStatistics(this.selectedYear, this.filterParams)
        .subscribe((statisticsData) => {

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 2);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);
          this.totalTransactions = this.statisticsBuildService.calculateTotalValueFromChartData(this.barChartData);

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
