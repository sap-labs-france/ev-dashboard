import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartData, ChartDataset, ChartOptions, Color } from 'chart.js';
import * as dayjs from 'dayjs';
import { AppUnitPipe } from 'shared/formatters/app-unit.pipe';
import { SiteAreasAuthorizations } from 'types/Authorization';
import { ConsumptionChartAxis, ConsumptionChartDatasetOrder } from 'types/Chart';
import { DateTimeRange } from 'types/Table';

import { CentralServerService } from '../../../../../services/central-server.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { AppDatePipe } from '../../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../../shared/formatters/app-decimal.pipe';
import { AppDurationPipe } from '../../../../../shared/formatters/app-duration.pipe';
import { SiteArea, SiteAreaConsumption, SiteAreaValueTypes } from '../../../../../types/SiteArea';
import { ConsumptionUnit } from '../../../../../types/Transaction';
import { Utils } from '../../../../../utils/Utils';

@Component({
  selector: 'app-site-area-chart',
  templateUrl: 'site-area-consumption-chart.component.html',
})

export class SiteAreaConsumptionChartComponent implements OnInit, AfterViewInit {
  @Input() public siteArea!: SiteArea;
  @Input() public siteAreasAuthorizations: SiteAreasAuthorizations;
  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('secondary', { static: true }) public secondaryElement!: ElementRef;
  @ViewChild('warning', { static: true }) public warningElement!: ElementRef;
  @ViewChild('success', { static: true }) public successElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;

  public siteAreaConsumptions!: SiteAreaConsumption;
  public selectedUnit = ConsumptionUnit.KILOWATT;
  public startDate = dayjs().startOf('d').toDate();
  public endDate = dayjs().endOf('d').toDate();
  public loadAllConsumptions = false;

  private graphCreated = false;
  private lineTension = 0;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private options!: ChartOptions;
  private chart!: Chart;
  private assetConsumptionsInstantPowerColor!: string;
  private assetProductionsInstantPowerColor!: string;
  private chargingStationsConsumptionsInstantPowerColor!: string;
  private netInstantPowerColor!: string;
  private limitColor!: string;
  private defaultColor!: string;
  private firstLabel: number;
  private visibleDatasets = [
    ConsumptionChartDatasetOrder.NET_CONSUMPTION_WATTS
  ];
  private gridDisplay = {
    [ConsumptionChartAxis.POWER]: true,
    [ConsumptionChartAxis.AMPERAGE]: true,
  };

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: AppDecimalPipe,
    private unitPipe: AppUnitPipe
  ) {
  }

  public ngOnInit() {
    if(this.siteAreasAuthorizations.canCreate && this.siteArea.canUpdate && this.siteArea.canDelete) {
      this.visibleDatasets.push(...[
        ConsumptionChartDatasetOrder.LIMIT_WATTS,
        ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_WATTS,
        ConsumptionChartDatasetOrder.ASSET_PRODUCTION_WATTS,
        ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_WATTS
      ]);
    }
  }

  public ngAfterViewInit() {
    this.netInstantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
    this.assetProductionsInstantPowerColor = this.getStyleColor(this.successElement.nativeElement);
    this.chargingStationsConsumptionsInstantPowerColor = this.getStyleColor(this.secondaryElement.nativeElement);
    this.assetConsumptionsInstantPowerColor = this.getStyleColor(this.warningElement.nativeElement);
    this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
    this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.refresh();
    }
  }

  public refresh() {
    this.spinnerService.show();
    this.centralServerService.getSiteAreaConsumptions(this.siteArea.id, this.startDate, this.endDate, this.loadAllConsumptions)
      .subscribe({
        next: (siteAreaConsumptions) => {
          this.spinnerService.hide();
          this.siteAreaConsumptions = siteAreaConsumptions;
          this.prepareOrUpdateGraph();
        },
        error: (error) => {
          this.spinnerService.hide();
          delete this.siteAreaConsumptions;
        }
      });
  }

  public loadAllConsumptionsChanged(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.loadAllConsumptions = matCheckboxChange.checked;
      this.refresh();
    }
  }

  public unitChanged(key: ConsumptionUnit) {
    this.spinnerService.show();
    this.selectedUnit = key;
    this.updateVisibleDatasets();
    this.createGraphData();
    this.prepareOrUpdateGraph();
    this.spinnerService.hide();
  }

  public dateFilterChanged(dateRangeValue: DateTimeRange) {
    this.startDate = dateRangeValue.startDate;
    this.endDate = dateRangeValue.endDate;
    this.refresh();
  }

  private updateVisibleDatasets(){
    this.visibleDatasets = [];
    this.data.datasets.forEach(dataset => {
      if(!dataset.hidden){
        this.visibleDatasets.push(dataset.order);
      }
    });
  }

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (this.canDisplayGraph()) {
      if (!this.graphCreated) {
        this.graphCreated = true;
        this.options = this.createOptions();
        this.createGraphData();
        this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'), {
          type: 'line',
          data: this.data,
          options: this.options,
        });
      }
      this.refreshDataSets();
      this.chart.update();
    }
  }

  // eslint-disable-next-line complexity
  private createGraphData() {
    const datasets: ChartDataset[] = [];
    // Asset Consumption Instant Amps/Power
    datasets.push({
      type: 'line',
      hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_AMPS) === -1
        && this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_WATTS) === -1,
      data: [],
      yAxisID: this.selectedUnit === ConsumptionUnit.AMPERE ? ConsumptionChartAxis.AMPERAGE : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.assetConsumptionsInstantPowerColor),
      label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
        'organization.graph.asset_consumption_amps' : 'organization.graph.asset_consumption_watts'),
      order: (this.selectedUnit === ConsumptionUnit.AMPERE) ?
        ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_AMPS :
        ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_WATTS,
      fill: 'origin',
    });
    // Charging Stations Consumption Instant Amps/Power
    datasets.push({
      type: 'line',
      hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_WATTS) === -1
        && this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_AMPS) === -1,
      data: [],
      yAxisID: this.selectedUnit === ConsumptionUnit.AMPERE ? ConsumptionChartAxis.AMPERAGE : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.chargingStationsConsumptionsInstantPowerColor),
      label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
        'organization.graph.charging_station_consumption_amps' : 'organization.graph.charging_station_consumption_watts'),
      order: (this.selectedUnit === ConsumptionUnit.AMPERE) ?
        ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_AMPS :
        ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_WATTS,
      fill: 'origin',
    });
    // Asset Production Instant Amps/Power
    datasets.push({
      type: 'line',
      hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.ASSET_PRODUCTION_WATTS) === -1
        && this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.ASSET_PRODUCTION_AMPS) === -1,
      data: [],
      yAxisID: this.selectedUnit === ConsumptionUnit.AMPERE ? ConsumptionChartAxis.AMPERAGE : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.assetProductionsInstantPowerColor),
      label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
        'organization.graph.asset_production_amps' : 'organization.graph.asset_production_watts'),
      order: (this.selectedUnit === ConsumptionUnit.AMPERE) ?
        ConsumptionChartDatasetOrder.ASSET_PRODUCTION_AMPS :
        ConsumptionChartDatasetOrder.ASSET_PRODUCTION_WATTS,
      fill: 'origin',
    });
    // Net Instant Amps/Power
    datasets.push({
      type: 'line',
      hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.NET_CONSUMPTION_AMPS) === -1
        && this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.NET_CONSUMPTION_WATTS) === -1,
      data: [],
      yAxisID: this.selectedUnit === ConsumptionUnit.AMPERE ? ConsumptionChartAxis.AMPERAGE : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.netInstantPowerColor),
      label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
        'organization.graph.net_consumption_amps' : 'organization.graph.net_consumption_watts'),
      order: (this.selectedUnit === ConsumptionUnit.AMPERE) ?
        ConsumptionChartDatasetOrder.NET_CONSUMPTION_AMPS :
        ConsumptionChartDatasetOrder.NET_CONSUMPTION_WATTS,
      fill: 'origin',
    });
    // Limit Amps/Power
    datasets.push({
      type: 'line',
      hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.LIMIT_AMPS) === -1
        && this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.LIMIT_WATTS) === -1,
      data: [],
      yAxisID: this.selectedUnit === ConsumptionUnit.AMPERE ? ConsumptionChartAxis.AMPERAGE : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.limitColor),
      label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
        'organization.graph.limit_amps' : 'organization.graph.limit_watts'),
      order: (this.selectedUnit === ConsumptionUnit.AMPERE) ?
        ConsumptionChartDatasetOrder.LIMIT_AMPS :
        ConsumptionChartDatasetOrder.LIMIT_WATTS,
      fill: 'origin',
    });
    // Assign
    this.data.labels = [];
    this.data.datasets = datasets;
  }

  private getDataSetByOrder(order: number): number[] | null {
    const foundDataSet = this.data.datasets.find((dataSet) => dataSet.order === order);
    return foundDataSet ? foundDataSet.data as number[] : null;
  }

  private canDisplayGraph() {
    return this.siteAreaConsumptions?.values?.length > 0;
  }

  private refreshDataSets() {
    for (const key of Object.keys(this.data.datasets)) {
      this.data.datasets[key].data = [];
    }
    const labels: number[] = [];
    const assetConsumptionsInstantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_WATTS);
    const assetConsumptionsInstantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_AMPS);
    const assetProductionsInstantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.ASSET_PRODUCTION_WATTS);
    const assetProductionsInstantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.ASSET_PRODUCTION_AMPS);
    const chargingStationsInstantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_WATTS);
    const chargingStationsInstantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_AMPS);
    const netConsumptionsInstantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.NET_CONSUMPTION_WATTS);
    const netConsumptionsInstantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.NET_CONSUMPTION_AMPS);
    const limitWattsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_WATTS);
    const limitAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_AMPS);
    for (const siteAreaConsumption of this.siteAreaConsumptions.values) {
      const dateTime = new Date(siteAreaConsumption.startedAt);
      labels.push(dateTime.getTime());
      if (assetConsumptionsInstantPowerDataSet) {
        assetConsumptionsInstantPowerDataSet.push(siteAreaConsumption[SiteAreaValueTypes.ASSET_CONSUMPTION_WATTS]);
      }
      if (assetConsumptionsInstantAmpsDataSet) {
        assetConsumptionsInstantAmpsDataSet.push(siteAreaConsumption[SiteAreaValueTypes.ASSET_CONSUMPTION_AMPS]);
      }
      if (assetProductionsInstantPowerDataSet) {
        assetProductionsInstantPowerDataSet.push(siteAreaConsumption[SiteAreaValueTypes.ASSET_PRODUCTION_WATTS]);
      }
      if (assetProductionsInstantAmpsDataSet) {
        assetProductionsInstantAmpsDataSet.push(siteAreaConsumption[SiteAreaValueTypes.ASSET_PRODUCTION_AMPS]);
      }
      if (chargingStationsInstantPowerDataSet) {
        chargingStationsInstantPowerDataSet.push(siteAreaConsumption[SiteAreaValueTypes.CHARGING_STATION_CONSUMPTION_WATTS]);
      }
      if (chargingStationsInstantAmpsDataSet) {
        chargingStationsInstantAmpsDataSet.push(siteAreaConsumption[SiteAreaValueTypes.CHARGING_STATION_CONSUMPTION_AMPS]);
      }
      if (netConsumptionsInstantPowerDataSet) {
        netConsumptionsInstantPowerDataSet.push(siteAreaConsumption[SiteAreaValueTypes.NET_CONSUMPTION_WATTS]);
      }
      if (netConsumptionsInstantAmpsDataSet) {
        netConsumptionsInstantAmpsDataSet.push(siteAreaConsumption[SiteAreaValueTypes.NET_CONSUMPTION_AMPS]);
      }
      if (limitWattsDataSet) {
        limitWattsDataSet.push(siteAreaConsumption.limitWatts);
      }
      if (limitAmpsDataSet) {
        limitAmpsDataSet.push(siteAreaConsumption.limitAmps);
      }
    }
    this.data.labels = labels;
    this.firstLabel = labels[0];
  }

  private createOptions(): ChartOptions {
    const options: ChartOptions = {
      animation: {
        duration: 0,
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: this.defaultColor,
          },
          onHover: (e, legendItem, legend) => {
            const status = legend.chart.data.datasets[legendItem.datasetIndex].hidden;
            if(!status){
              legend.chart.data.datasets.forEach((dataset) => dataset.borderWidth = 1);
              legend.chart.data.datasets[legendItem.datasetIndex].borderWidth = 5;
              legend.chart.update();
            }
          },
          onLeave: (e, legendItem, legend) => {
            legend.chart.data.datasets.forEach((dataset) => dataset.borderWidth = 3);
            legend.chart.update();
          },
          onClick: (e, legendItem, legend) => {
            const status = legend.chart.data.datasets[legendItem.datasetIndex].hidden;
            legend.chart.data.datasets[legendItem.datasetIndex].hidden = !status;
            this.data.datasets[legendItem.datasetIndex].hidden = !status;
            legend.chart.update();
          }
        },
        tooltip: {
          bodySpacing: 5,
          mode: 'index',
          position: 'nearest',
          intersect: false,
          callbacks: {
            labelColor: (context) => ({
              borderColor: context.dataset.borderColor as Color,
              backgroundColor: context.dataset.borderColor as Color,
              dash: context.dataset.borderDash,
            }),
            // eslint-disable-next-line complexity
            label: (context) => {
              const dataset = context.dataset;
              const value = dataset.data[context.dataIndex] as number;
              const label = context.dataset.label;
              let tooltipLabel = '';
              switch (context.dataset.order) {
                case ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_WATTS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value / 1000, '2.0-0')}kW`;
                  break;
                case ConsumptionChartDatasetOrder.ASSET_CONSUMPTION_AMPS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value, '2.0-0')}A`;
                  break;
                case ConsumptionChartDatasetOrder.ASSET_PRODUCTION_WATTS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value / 1000, '2.0-0')}kW`;
                  break;
                case ConsumptionChartDatasetOrder.ASSET_PRODUCTION_AMPS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value, '2.0-0')}A`;
                  break;
                case ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_WATTS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value / 1000, '2.0-0')}kW`;
                  break;
                case ConsumptionChartDatasetOrder.CHARGING_STATION_CONSUMPTION_AMPS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value, '2.0-0')}A`;
                  break;
                case ConsumptionChartDatasetOrder.NET_CONSUMPTION_WATTS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value / 1000, '2.0-0')}kW`;
                  break;
                case ConsumptionChartDatasetOrder.NET_CONSUMPTION_AMPS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value, '2.0-0')}A`;
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_WATTS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value / 1000, '2.0-0')}kW`;
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_AMPS:
                  tooltipLabel = ` ${this.decimalPipe.transform(value, '2.0-0')}A`;
                  break;
                default:
                  tooltipLabel = `${value}`;
              }
              return `${label}: ${tooltipLabel}`;
            },
            title: (tooltipItems) => {
              const firstDate = new Date(this.firstLabel);
              const currentDate = new Date(tooltipItems[0].parsed.x);
              return this.datePipe.transform(currentDate) + ' - ' + this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000);
            },
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        [ConsumptionChartAxis.X]:{
          type: 'time',
          time: {
            tooltipFormat: dayjs.localeData().longDateFormat('LT'),
            unit: 'minute',
            displayFormats: {
              second: dayjs.localeData().longDateFormat('LTS'),
              minute: dayjs.localeData().longDateFormat('LT'),
            },
          },
          grid: {
            display: true,
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            autoSkip: true,
            color: this.defaultColor,
          },
        },
        [ConsumptionChartAxis.POWER]:{
          type: 'linear',
          position: 'left',
          display: 'auto',
          ticks: {
            callback: (value: number) => this.unitPipe.transform(value, 'W', 'kW', true, 1, 0, 1),
            color: this.defaultColor,
          },
          grid: {
            display: true,
            drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.POWER],
            color: 'rgba(0,0,0,0.2)',
          },
          title: {
            display: true,
            text: this.translateService.instant('transactions.consumption') + ' (W)',
          }
        },
        [ConsumptionChartAxis.AMPERAGE]: {
          type: 'linear',
          position: 'left',
          display: 'auto',
          grid: {
            display: true,
            drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.AMPERAGE],
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            callback: (value: number) => this.decimalPipe.transform(value, '1.0-1') + ' A',
            color: this.defaultColor,
          },
          title: {
            display: true,
            text: this.translateService.instant('transactions.consumption') + ' (A)',
          }
        },
      },
    };
    return options;
  }
}
