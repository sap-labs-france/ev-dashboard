import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { StatisticsAuthorizations } from 'types/Authorization';
import { ChartTypeValues } from 'types/Chart';
import { StatisticDataResult } from 'types/DataResult';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { FilterParams } from '../../../types/GlobalType';
import { SimpleChart } from '../shared/chart-utilities';
import { StatisticsBuildService } from '../shared/statistics-build.service';
import { StatisticsExportService } from '../shared/statistics-export.service';

@Component({
  selector: 'app-statistics-inactivity',
  templateUrl: 'statistics-inactivity.component.html',
})
export class StatisticsInactivityComponent implements OnInit {
  @ViewChild('inactivityBarChart', { static: true }) public ctxBarChart!: ElementRef;
  @ViewChild('inactivityPieChart', { static: true }) public ctxPieChart!: ElementRef;

  public totalInactivity = 0;
  public selectedChart!: string;
  public selectedCategory!: string;
  public selectedDateRange!: any;
  public selectedYear!: number;
  public allYears = true;
  public chartsInitialized = false;
  public authorizations: StatisticsAuthorizations;

  private filterParams!: FilterParams;
  private barChart!: SimpleChart;
  private pieChart!: SimpleChart;
  private barChartData!: ChartData;
  private pieChartData!: ChartData;
  private language!: string;

  public constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private spinnerService: SpinnerService,
    private statisticsBuildService: StatisticsBuildService,
    private statisticsExportService: StatisticsExportService
  ) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
  }

  public ngOnInit(): void {
    this.initCharts();
  }

  public scopeChanged(chartName: string): void {
    this.selectedChart = chartName;
  }

  public categoryChanged(category: string): void {
    this.selectedCategory = category;
  }

  public yearChanged(year: number): void {
    this.selectedYear = year;
  }

  public dateRangeChange(date: any) {
    this.selectedDateRange = date;
  }

  public filtersChanged(filterParams: FilterParams): void {
    this.filterParams = filterParams;
  }

  public exportData(): void {
    const enhancedFilterParams = this.statisticsExportService.enhanceFilterParams(
      this.filterParams,
      'Inactivity',
      this.selectedCategory,
      this.selectedYear,
      this.selectedChart
    );
    this.statisticsExportService.exportDataWithDialog(
      enhancedFilterParams,
      this.translateService.instant('statistics.dialog.inactivity.export.title'),
      this.translateService.instant('statistics.dialog.inactivity.export.confirm')
    );
  }

  public getChartLabel(): string {
    let mainLabel: string;
    if (!this.selectedChart || !this.selectedCategory) {
      // selection not yet defined:
      return ' ';
    }
    if (this.selectedChart === 'month') {
      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.inactivity_per_cs_month_title', {
          total: Math.round(this.totalInactivity).toLocaleString(this.language),
        });
      } else {
        mainLabel = this.translateService.instant('statistics.inactivity_per_user_month_title', {
          total: Math.round(this.totalInactivity).toLocaleString(this.language),
        });
      }
    } else {
      if (this.selectedCategory === 'C') {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.inactivity_per_cs_year_title', {
            total: Math.round(this.totalInactivity).toLocaleString(this.language),
          });
        } else if (this.selectedYear < 0) {
          mainLabel = this.translateService.instant(
            'statistics.inactivity_per_cs_timeFrame_title',
            { total: Math.round(this.totalInactivity).toLocaleString(this.language) }
          );
        } else {
          mainLabel = this.translateService.instant('statistics.inactivity_per_cs_total_title', {
            total: Math.round(this.totalInactivity).toLocaleString(this.language),
          });
        }
      } else {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.inactivity_per_user_year_title', {
            total: Math.round(this.totalInactivity).toLocaleString(this.language),
          });
        } else if (this.selectedYear < 0) {
          mainLabel = this.translateService.instant(
            'statistics.inactivity_per_user_timeFrame_title',
            { total: Math.round(this.totalInactivity).toLocaleString(this.language) }
          );
        } else {
          mainLabel = this.translateService.instant('statistics.inactivity_per_user_total_title', {
            total: Math.round(this.totalInactivity).toLocaleString(this.language),
          });
        }
      }
    }
    return mainLabel;
  }

  public initCharts(): void {
    const labelXAxis: string = this.translateService.instant(
      'statistics.graphic_title_month_x_axis'
    );
    const labelYAxis: string = this.translateService.instant(
      'statistics.graphic_title_inactivity_y_axis'
    );
    const toolTipUnit: string = this.translateService.instant('statistics.hours');
    this.barChart = new SimpleChart(
      this.language,
      ChartTypeValues.STACKED_BAR,
      this.getChartLabel(),
      labelXAxis,
      labelYAxis,
      toolTipUnit,
      true
    );
    this.barChart.initChart(this.ctxBarChart);
    this.pieChart = new SimpleChart(
      this.language,
      ChartTypeValues.PIE,
      this.getChartLabel(),
      undefined,
      undefined,
      toolTipUnit,
      true
    );
    this.pieChart.initChart(this.ctxPieChart);
    this.chartsInitialized = true;
  }

  public updateCharts(refresh: boolean): void {
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

  public buildCharts(): void {
    // Append withAuth filter to retrieve auth - this also changes the response into datasource
    this.filterParams['WithAuth'] = 'true';
    this.spinnerService.show();
    if (this.selectedCategory === 'C') {
      this.centralServerService
        .getChargingStationInactivityStatistics(this.selectedYear, this.filterParams)
        .subscribe((statisticsData) => {
          this.initAuth(statisticsData);
          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(
            statisticsData.result,
            2
          );
          this.pieChartData =
            this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(
              this.barChartData
            );
          this.totalInactivity = this.statisticsBuildService.calculateTotalValueFromChartData(
            this.barChartData
          );
          if (this.selectedChart === 'month') {
            this.barChart.updateChart(this.barChartData, this.getChartLabel());
          } else {
            this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
          }
          this.spinnerService.hide();
        });
    } else {
      this.centralServerService
        .getUserInactivityStatistics(this.selectedYear, this.filterParams)
        .subscribe((statisticsData) => {
          this.initAuth(statisticsData);
          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(
            statisticsData.result,
            2
          );
          this.pieChartData =
            this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(
              this.barChartData
            );
          this.totalInactivity = this.statisticsBuildService.calculateTotalValueFromChartData(
            this.barChartData
          );
          if (this.selectedChart === 'month') {
            this.barChart.updateChart(this.barChartData, this.getChartLabel());
          } else {
            this.pieChart.updateChart(this.pieChartData, this.getChartLabel());
          }
          this.spinnerService.hide();
        });
    }
  }

  private initAuth(statisticsData: StatisticDataResult) {
    this.authorizations = {
      canListUsers: Utils.convertToBoolean(statisticsData.canListUsers),
      canListChargingStations: Utils.convertToBoolean(statisticsData.canListChargingStations),
      canListSites: Utils.convertToBoolean(statisticsData.canListSites),
      canListSiteAreas: Utils.convertToBoolean(statisticsData.canListSiteAreas),
      canExport: Utils.convertToBoolean(statisticsData.canExport),
    };
  }
}
