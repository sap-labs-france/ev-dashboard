import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartData, ChartDataset, ChartOptions, Color } from 'chart.js';
import * as moment from 'moment';
import { ConsumptionChartAxis, ConsumptionChartDatasetOrder } from 'types/Chart';

import { CentralServerService } from '../../../../services/central-server.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { AppDecimalPipe } from '../../../../shared/formatters/app-decimal.pipe';
import { AppDurationPipe } from '../../../../shared/formatters/app-duration.pipe';
import { AppUnitPipe } from '../../../../shared/formatters/app-unit.pipe';
import { AssetConsumption, AssetType } from '../../../../types/Asset';
import { ConsumptionUnit } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';

@Component({
  selector: 'app-asset-chart',
  templateUrl: 'asset-consumption-chart.component.html',
})
export class AssetConsumptionChartComponent implements OnInit, AfterViewInit {
  @Input() public assetID!: string;
  @Input() public asset!: AssetConsumption;
  @Input() public assetType!: AssetType;

  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('success', { static: true }) public successElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;

  public selectedUnit = ConsumptionUnit.KILOWATT;
  public dateControl!: AbstractControl;
  public startDate = moment().startOf('d').toDate();
  public endDate = moment().endOf('d').toDate();

  private graphCreated = false;
  private lineTension = 0;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private options!: ChartOptions;
  private chart!: Chart;
  private instantPowerColor!: string;
  private limitColor!: string;
  private stateOfChargeColor!: string;
  private defaultColor!: string;
  private firstLabel: number;
  private visibleDatasets = [
    ConsumptionChartDatasetOrder.INSTANT_WATTS,
    ConsumptionChartDatasetOrder.STATE_OF_CHARGE,
  ];
  private gridDisplay = {
    [ConsumptionChartAxis.POWER]: true,
    [ConsumptionChartAxis.AMPERAGE]: false,
    [ConsumptionChartAxis.PERCENTAGE]: true,
  };

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private decimalPipe: AppDecimalPipe,
    private unitPipe: AppUnitPipe,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe
  ) {}

  public ngOnInit() {
    // Date control
    this.dateControl = new UntypedFormControl(
      'dateControl',
      Validators.compose([Validators.required])
    );
    this.dateControl.setValue(this.startDate);
  }

  public ngAfterViewInit() {
    this.instantPowerColor = this.getStyleColor(this.primaryElement.nativeElement);
    this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
    this.stateOfChargeColor = this.getStyleColor(this.successElement.nativeElement);
    this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.refresh();
    }
  }

  public refresh() {
    this.spinnerService.show();
    // Change Date for testing e.g.:
    this.centralServerService
      .getAssetConsumption(this.assetID, this.startDate, this.endDate)
      .subscribe(
        (assetConsumption: AssetConsumption) => {
          this.spinnerService.hide();
          this.asset = assetConsumption;
          this.prepareOrUpdateGraph();
        },
        (error) => {
          this.spinnerService.hide();
          delete this.asset;
        }
      );
  }

  public unitChanged(key: ConsumptionUnit) {
    this.spinnerService.show();
    this.selectedUnit = key;
    this.updateVisibleDatasets();
    this.createGraphData();
    this.prepareOrUpdateGraph();
    this.spinnerService.hide();
  }

  public dateFilterChanged(value: Date) {
    if (value) {
      this.startDate = moment(value).startOf('d').toDate();
      this.endDate = moment(value).endOf('d').toDate();
      this.refresh();
    }
  }

  private updateVisibleDatasets() {
    this.visibleDatasets = [];
    this.data.datasets.forEach((dataset) => {
      if (!dataset.hidden) {
        this.visibleDatasets.push(dataset.order);
      }
    });
  }

  private updateVisibleGridLines() {
    const visibleDatasets = this.data.datasets.filter((ds) => !ds.hidden).map((ds) => ds.order);
    for (const key in this.gridDisplay) {
      if (Object.prototype.hasOwnProperty.call(this.gridDisplay, key)) {
        this.gridDisplay[key] = false;
      }
    }
    if (
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_WATTS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.LIMIT_WATTS)
    ) {
      this.gridDisplay[ConsumptionChartAxis.POWER] = true;
    } else if (
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.LIMIT_AMPS)
    ) {
      this.gridDisplay[ConsumptionChartAxis.AMPERAGE] = true;
    } else if (visibleDatasets.includes(ConsumptionChartDatasetOrder.STATE_OF_CHARGE)) {
      this.gridDisplay[ConsumptionChartAxis.PERCENTAGE] = true;
    }
  }

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (this.canDisplayGraph()) {
      this.createGraphData();
      this.refreshDataSets();
      this.options = this.createOptions();
      if (!this.graphCreated) {
        this.graphCreated = true;
        this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'), {
          type: 'line',
          data: this.data,
          options: this.options,
        });
      } else {
        this.chart.options = this.options;
      }
      this.chart.update();
    }
  }

  private createGraphData() {
    const datasets: ChartDataset[] = [];
    // Instant Amps/Power
    datasets.push({
      type: 'line',
      hidden:
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS) === -1 &&
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_WATTS) === -1,
      data: [],
      yAxisID:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartAxis.AMPERAGE
          : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.instantPowerColor),
      label: this.translateService.instant(
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? 'transactions.graph.amps'
          : 'asset.graph.power'
      ),
      fill: 'origin',
      order:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartDatasetOrder.INSTANT_AMPS
          : ConsumptionChartDatasetOrder.INSTANT_WATTS,
    });
    // Limit Amps/Power
    datasets.push({
      type: 'line',
      hidden:
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.LIMIT_AMPS) === -1 &&
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.LIMIT_WATTS) === -1,
      data: [],
      yAxisID:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartAxis.AMPERAGE
          : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.limitColor),
      label: this.translateService.instant(
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? 'transactions.graph.limit_amps'
          : 'asset.graph.limit_watts'
      ),
      fill: 'origin',
      order:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartDatasetOrder.LIMIT_AMPS
          : ConsumptionChartDatasetOrder.LIMIT_WATTS,
    });
    if (this.asset.values[this.asset.values.length - 1].stateOfCharge) {
      datasets.push({
        type: 'line',
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.STATE_OF_CHARGE) === -1,
        data: [],
        yAxisID: ConsumptionChartAxis.PERCENTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.stateOfChargeColor),
        label: this.translateService.instant('transactions.graph.battery'),
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.STATE_OF_CHARGE,
      });
    }
    // Assign
    this.data.labels = [];
    this.data.datasets = datasets;
  }

  private getDataSetByOrder(order: number): number[] | null {
    const dataSet = this.data.datasets.find((d) => d.order === order);
    return dataSet ? (dataSet.data as number[]) : null;
  }

  private canDisplayGraph() {
    return this.asset?.values?.length > 1;
  }

  private refreshDataSets() {
    this.updateVisibleGridLines();
    for (const key of Object.keys(this.data.datasets)) {
      this.data.datasets[key].data = [];
    }
    const instantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.INSTANT_WATTS);
    const instantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.INSTANT_AMPS);
    const limitWattsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_WATTS);
    const limitAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_AMPS);
    const stateOfChargeDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.STATE_OF_CHARGE
    );
    const labels: number[] = [];
    // Add last point
    if (!Utils.isEmptyArray(this.asset.values)) {
      this.asset.values.push({
        ...this.asset.values[this.asset.values.length - 1],
        startedAt: this.asset.values[this.asset.values.length - 1].endedAt,
      });
    }
    for (const consumption of this.asset.values) {
      labels.push(new Date(consumption.startedAt).getTime());
      if (instantPowerDataSet) {
        const value =
          this.assetType === AssetType.PRODUCTION
            ? consumption.instantWatts * -1
            : consumption.instantWatts;
        instantPowerDataSet.push(value);
      }
      if (instantAmpsDataSet) {
        const value =
          this.assetType === AssetType.PRODUCTION
            ? consumption.instantAmps * -1
            : consumption.instantAmps;
        instantAmpsDataSet.push(value);
      }
      if (limitWattsDataSet) {
        if (consumption.limitWatts) {
          limitWattsDataSet.push(consumption.limitWatts);
        } else {
          limitWattsDataSet.push(
            !Utils.isEmptyArray(limitWattsDataSet)
              ? limitWattsDataSet[limitWattsDataSet.length - 1]
              : 0
          );
        }
      }
      if (limitAmpsDataSet) {
        if (consumption.limitAmps) {
          limitAmpsDataSet.push(consumption.limitAmps);
        } else {
          limitAmpsDataSet.push(
            !Utils.isEmptyArray(limitAmpsDataSet)
              ? limitAmpsDataSet[limitAmpsDataSet.length - 1]
              : 0
          );
        }
      }
      if (stateOfChargeDataSet) {
        if (consumption.stateOfCharge) {
          stateOfChargeDataSet.push(consumption.stateOfCharge);
        } else {
          stateOfChargeDataSet.push(0);
        }
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
            if (!status) {
              legend.chart.data.datasets.forEach((dataset) => (dataset.borderWidth = 1));
              legend.chart.data.datasets[legendItem.datasetIndex].borderWidth = 5;
              legend.chart.update();
            }
          },
          onLeave: (e, legendItem, legend) => {
            legend.chart.data.datasets.forEach((dataset) => (dataset.borderWidth = 3));
            legend.chart.update();
          },
          onClick: (e, legendItem, legend) => {
            const dataset = legend.chart.data.datasets[legendItem.datasetIndex];
            const status = dataset.hidden;
            dataset.hidden = !status;
            this.data.datasets[legendItem.datasetIndex].hidden = !status;
            this.updateVisibleGridLines();
            legend.chart.options = this.createOptions();
            legend.chart.update();
          },
        },
        tooltip: {
          bodySpacing: 5,
          mode: 'index',
          position: 'nearest',
          multiKeyBackground: Utils.toRgba(this.instantPowerColor, 0.7),
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
                case ConsumptionChartDatasetOrder.INSTANT_WATTS:
                  tooltipLabel = ' ' + this.unitPipe.transform(value, 'W', 'kW', true, 1, 0, 1);
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + 'A';
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_WATTS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-1') + 'kW';
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_AMPS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + 'A';
                  break;
                case ConsumptionChartDatasetOrder.STATE_OF_CHARGE:
                  tooltipLabel = ` ${value} %`;
                  break;
                default:
                  tooltipLabel = value + '';
              }
              return `${label}: ${tooltipLabel}`;
            },
            title: (tooltipItems) => {
              const firstDate = new Date(this.firstLabel);
              const currentDate = new Date(tooltipItems[0].parsed.x);
              return (
                this.datePipe.transform(currentDate) +
                ' - ' +
                this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000)
              );
            },
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        [ConsumptionChartAxis.X]: {
          type: 'time',
          time: {
            tooltipFormat: moment.localeData().longDateFormat('LT'),
            unit: 'minute',
            displayFormats: {
              second: moment.localeData().longDateFormat('LTS'),
              minute: moment.localeData().longDateFormat('LT'),
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
        [ConsumptionChartAxis.POWER]: {
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
          },
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
          },
        },
        [ConsumptionChartAxis.PERCENTAGE]: {
          type: 'linear',
          position: 'right',
          display: 'auto',
          grid: {
            display: true,
            drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.PERCENTAGE],
            color: 'rgba(0,0,0,0.2)',
          },
          ticks: {
            callback: (value) => `${value} %`,
            color: this.defaultColor,
          },
          title: {
            display: true,
            text: this.translateService.instant('transactions.graph.battery'),
          },
        },
      },
    };
    return options;
  }
}
