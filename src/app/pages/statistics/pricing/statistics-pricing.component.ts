import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableFilterDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentEnum, ComponentService } from '../../../services/component.service';
import { LocaleService } from '../../../services/locale.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ChargerTableFilter } from '../../../shared/table/filters/charger-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SitesTableFilter } from '../../../shared/table/filters/sites-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { ChartData, SimpleChart } from '../shared/chart-utilities';
import { StatisticsBuildService, StatisticsBuildValueWithUnit } from '../shared/statistics-build.service';
import { StatisticsExportService } from '../shared/statistics-export.service';

@Component({
  selector: 'app-statistics-pricing',
  templateUrl: './statistics-pricing.component.html'
})

export class StatisticsPricingComponent implements OnInit {
  public isPricingActive = false;

  public selectedChart: string;
  public selectedCategory: string;
  public selectedYear: number;
  public allYears = true;
  public allFiltersDef: TableFilterDef[] = [];
  public chartsInitialized = false;

  @ViewChild('pricingBarChart', { static: true }) ctxBarChart: ElementRef;
  @ViewChild('pricingPieChart', { static: true }) ctxPieChart: ElementRef;

  private filterParams: Object;
  private barChart: SimpleChart;
  private pieChart: SimpleChart;
  private barChartData: ChartData;
  private pieChartData: ChartData;
  private totalPriceWithUnit: StatisticsBuildValueWithUnit[] = [];

  constructor(
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private spinnerService: SpinnerService,
    private statisticsBuildService: StatisticsBuildService,
    private statisticsExportService: StatisticsExportService) {
    this.isPricingActive = this.componentService.isActive(ComponentEnum.PRICING);
  }

  ngOnInit(): void {
    let filterDef: TableFilterDef;
    filterDef = new SitesTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new SiteAreaTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new ChargerTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    filterDef = new UserTableFilter().getFilterDef();
    this.allFiltersDef.push(filterDef);

    if (this.isPricingActive) {
      this.initCharts();
    }
  }

  scopeChanged(chartName): void {
    this.selectedChart = chartName;
  }

  categoryChanged(category): void {
    this.selectedCategory = category;
  }

  yearChanged(year): void {
    this.selectedYear = year;
  }

  filtersChanged(filterParams): void {
    this.filterParams = filterParams;
  }

  exportData(): void {
    const enhancedFilterParams = this.statisticsExportService.enhanceFilterParams(this.filterParams, 'Pricing',
      this.selectedCategory, this.selectedYear, this.selectedChart);
    this.statisticsExportService.exportDataWithDialog(enhancedFilterParams,
      this.translateService.instant('statistics.dialog.pricing.export.title'),
      this.translateService.instant('statistics.dialog.pricing.export.confirm'));
  }

  getChartLabel(): string {
    let mainLabel: string;

    if (!this.selectedChart || !this.selectedCategory) {
      // selection not yet defined:
      return ' ';
    }

    let totalPriceString = '';
    this.totalPriceWithUnit.forEach((object) => {
      if (object.value && object.value !== 0) {
        if (totalPriceString) {
          totalPriceString += ' + ';
        }
        totalPriceString += Math.round(object.value).toLocaleString(this.localeService.language) + ' ' + object.unit;
      }
    });
    if (this.selectedChart === 'month') {
      if (this.selectedCategory === 'C') {
        mainLabel = this.translateService.instant('statistics.pricing_per_cs_month_title',
          { 'total': totalPriceString });
      } else {
        mainLabel = this.translateService.instant('statistics.pricing_per_user_month_title',
          { 'total': totalPriceString });
      }
    } else {
      if (this.selectedCategory === 'C') {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.pricing_per_cs_year_title',
            { 'total': totalPriceString });
        } else {
          mainLabel = this.translateService.instant('statistics.pricing_per_cs_total_title',
            { 'total': totalPriceString });
        }
      } else {
        if (this.selectedYear > 0) {
          mainLabel = this.translateService.instant('statistics.pricing_per_user_year_title',
            { 'total': totalPriceString });
        } else {
          mainLabel = this.translateService.instant('statistics.pricing_per_user_total_title',
            { 'total': totalPriceString });
        }
      }
    }

    return mainLabel;
  }

  initCharts(): void {
    // Guess a currency unit (to be adjusted later)
    this.totalPriceWithUnit.push({ value: 0, unit: 'EUR' });
    const toolTipUnit: string = this.totalPriceWithUnit[0].unit;
    const labelXAxis: string = this.translateService.instant('statistics.graphic_title_month_x_axis');
    const labelYAxis: string = this.translateService.instant('statistics.graphic_title_pricing_y_axis',
      { 'currency': toolTipUnit });

    this.barChart = new SimpleChart(this.localeService.language, 'stackedBar',
      this.getChartLabel(), labelXAxis, labelYAxis, toolTipUnit, true);
    this.barChart.initChart(this.ctxBarChart);

    this.pieChart = new SimpleChart(this.localeService.language, 'pie',
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

      if (this.isPricingActive) {
        this.buildCharts();
      }
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
    let newToolTipUnit: string;
    let newLabelYAxis: string;
    let addUnitToLabel = false;

    if (this.selectedCategory === 'C') {
      this.centralServerService.getChargingStationPricingStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.totalPriceWithUnit = this.statisticsBuildService.calculateTotalsWithUnits(statisticsData, 2);

          if (this.totalPriceWithUnit.length > 1) {
            addUnitToLabel = true;
            newToolTipUnit = this.translateService.instant('statistics.multiple_currencies');
          } else {
            newToolTipUnit = this.totalPriceWithUnit[0].unit;
          }
          newLabelYAxis = this.translateService.instant('statistics.graphic_title_pricing_y_axis', { 'currency': newToolTipUnit });

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 2, addUnitToLabel);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);

          this.barChart.updateChart(this.barChartData, this.getChartLabel(), newToolTipUnit, newLabelYAxis);
          this.pieChart.updateChart(this.pieChartData, this.getChartLabel(), newToolTipUnit);

          this.spinnerService.hide();
        });
    } else {
      this.centralServerService.getUserPricingStatistics(this.selectedYear, this.filterParams)
        .subscribe(statisticsData => {

          this.totalPriceWithUnit = this.statisticsBuildService.calculateTotalsWithUnits(statisticsData, 2);

          if (this.totalPriceWithUnit.length > 1) {
            addUnitToLabel = true;
            newToolTipUnit = this.translateService.instant('statistics.multiple_currencies');
          } else {
            newToolTipUnit = this.totalPriceWithUnit[0].unit;
          }
          newLabelYAxis = this.translateService.instant('statistics.graphic_title_pricing_y_axis', { 'currency': newToolTipUnit });

          this.barChartData = this.statisticsBuildService.buildStackedChartDataForMonths(statisticsData, 2, addUnitToLabel);
          this.pieChartData = this.statisticsBuildService.calculateTotalChartDataFromStackedChartData(this.barChartData);

          this.barChart.updateChart(this.barChartData, this.getChartLabel(), newToolTipUnit, newLabelYAxis);
          this.pieChart.updateChart(this.pieChartData, this.getChartLabel(), newToolTipUnit);

          this.spinnerService.hide();
        });
    }
  }
}
