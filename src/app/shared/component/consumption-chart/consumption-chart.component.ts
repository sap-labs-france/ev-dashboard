import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartData, ChartDataset, ChartOptions, Color } from 'chart.js';
import * as moment from 'moment';
import { ConsumptionChartAxis, ConsumptionChartDatasetOrder } from 'types/Chart';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { ConsumptionUnit, Transaction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { AppDatePipe } from '../../formatters/app-date.pipe';
import { AppDecimalPipe } from '../../formatters/app-decimal.pipe';

@Component({
  selector: 'app-transaction-chart',
  templateUrl: 'consumption-chart.component.html',
})
export class ConsumptionChartComponent implements AfterViewInit {
  @Input() public inDialog!: boolean;
  @Input() public transactionId!: number;
  @Input() public transaction!: Transaction;
  @Input() public ratio!: number;

  @ViewChild('primary', { static: true }) public primaryElement!: ElementRef;
  @ViewChild('primary1', { static: true }) public primary1Element!: ElementRef;
  @ViewChild('primary2', { static: true }) public primary2Element!: ElementRef;
  @ViewChild('primary3', { static: true }) public primary3Element!: ElementRef;
  @ViewChild('accent', { static: true }) public accentElement!: ElementRef;
  @ViewChild('danger', { static: true }) public dangerElement!: ElementRef;
  @ViewChild('success', { static: true }) public successElement!: ElementRef;
  @ViewChild('chart', { static: true }) public chartElement!: ElementRef;
  @ViewChild('warning', { static: true }) public warningElement!: ElementRef;
  @ViewChild('cyan', { static: true }) public cyanElement!: ElementRef;
  @ViewChild('purple', { static: true }) public purpleElement!: ElementRef;
  @ViewChild('purple1', { static: true }) public purple1Element!: ElementRef;
  @ViewChild('purple2', { static: true }) public purple2Element!: ElementRef;
  @ViewChild('purple3', { static: true }) public purple3Element!: ElementRef;
  @ViewChild('yellow', { static: true }) public yellowElement!: ElementRef;

  public loadAllConsumptions = false;
  public selectedUnit = ConsumptionUnit.KILOWATT;

  private graphCreated = false;
  private lineTension = 0;
  private firstLabel: number;
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private chart!: Chart;
  private consumptionColor!: string;
  private instantPowerAmpsColor!: string;
  private instantPowerAmpsL1Color!: string;
  private instantPowerAmpsL2Color!: string;
  private instantPowerAmpsL3Color!: string;
  private amountColor!: string;
  private limitColor!: string;
  private stateOfChargeColor!: string;
  private instantVoltsColor!: string;
  private instantVoltsL1Color!: string;
  private instantVoltsL2Color!: string;
  private instantVoltsL3Color!: string;
  private defaultColor!: string;
  private instantAmpsDCColor!: string;
  private visibleDatasets = [
    ConsumptionChartDatasetOrder.INSTANT_WATTS,
    ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH,
    ConsumptionChartDatasetOrder.STATE_OF_CHARGE,
  ];
  private gridDisplay = {
    [ConsumptionChartAxis.POWER]: true,
    [ConsumptionChartAxis.AMPERAGE]: true,
    [ConsumptionChartAxis.PERCENTAGE]: false,
    [ConsumptionChartAxis.VOLTAGE]: false,
    [ConsumptionChartAxis.AMOUNT]: false,
  };

  public constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: AppDecimalPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private authorizationService: AuthorizationService
  ) {
    if (this.authorizationService.isAdmin()) {
      this.visibleDatasets.push(ConsumptionChartDatasetOrder.LIMIT_WATTS);
    }
  }

  public ngAfterViewInit() {
    this.instantPowerAmpsColor = this.getStyleColor(this.primaryElement.nativeElement);
    this.instantPowerAmpsL1Color = this.getStyleColor(this.primary1Element.nativeElement);
    this.instantPowerAmpsL2Color = this.getStyleColor(this.primary2Element.nativeElement);
    this.instantPowerAmpsL3Color = this.getStyleColor(this.primary3Element.nativeElement);
    this.consumptionColor = this.getStyleColor(this.cyanElement.nativeElement);
    this.amountColor = this.getStyleColor(this.warningElement.nativeElement);
    this.stateOfChargeColor = this.getStyleColor(this.successElement.nativeElement);
    this.limitColor = this.getStyleColor(this.dangerElement.nativeElement);
    this.instantVoltsColor = this.getStyleColor(this.purpleElement.nativeElement);
    this.instantAmpsDCColor = this.getStyleColor(this.yellowElement.nativeElement);
    this.instantVoltsL1Color = this.getStyleColor(this.purple1Element.nativeElement);
    this.instantVoltsL2Color = this.getStyleColor(this.purple2Element.nativeElement);
    this.instantVoltsL3Color = this.getStyleColor(this.purple3Element.nativeElement);
    this.defaultColor = this.getStyleColor(this.chartElement.nativeElement);
    if (this.canDisplayGraph()) {
      this.prepareOrUpdateGraph();
    } else {
      this.refresh();
    }
  }

  public refresh() {
    this.centralServerService
      .getTransactionConsumption(this.transactionId, this.loadAllConsumptions)
      .subscribe({
        next: (transaction) => {
          this.transaction = transaction;
          this.prepareOrUpdateGraph();
        },
        error: (error) => {
          delete this.transaction;
        },
      });
  }

  public loadAllConsumptionsChanged(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.loadAllConsumptions = matCheckboxChange.checked;
      this.updateVisibleDatasets();
      this.refresh();
    }
  }

  public unitChanged(key: ConsumptionUnit) {
    this.selectedUnit = key;
    this.prepareOrUpdateGraph();
  }

  private updateVisibleDatasets() {
    if (this.data.datasets.length > 0) {
      this.visibleDatasets = [];
      this.data.datasets.forEach((dataset) => {
        if (!dataset.hidden) {
          this.visibleDatasets.push(dataset.order);
        }
      });
    }
  }

  // eslint-disable-next-line complexity
  private updateVisibleGridLines() {
    const visibleDatasets = this.data.datasets.filter((ds) => !ds.hidden).map((ds) => ds.order);
    for (const key in this.gridDisplay) {
      if (Object.prototype.hasOwnProperty.call(this.gridDisplay, key)) {
        this.gridDisplay[key] = false;
      }
    }
    if (
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_WATTS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_WATTS_L1) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_WATTS_L2) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_WATTS_L3) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.LIMIT_WATTS)
    ) {
      this.gridDisplay[ConsumptionChartAxis.POWER] = true;
    } else if (
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS_L1) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS_L2) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS_L3) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_AMPS_DC) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_AMPS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.LIMIT_AMPS)
    ) {
      this.gridDisplay[ConsumptionChartAxis.AMPERAGE] = true;
    } else if (
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_VOLTS) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L1) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L2) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L3) ||
      visibleDatasets.includes(ConsumptionChartDatasetOrder.INSTANT_VOLTS_DC)
    ) {
      this.gridDisplay[ConsumptionChartAxis.VOLTAGE] = true;
    } else if (visibleDatasets.includes(ConsumptionChartDatasetOrder.STATE_OF_CHARGE)) {
      this.gridDisplay[ConsumptionChartAxis.PERCENTAGE] = true;
    } else if (visibleDatasets.includes(ConsumptionChartDatasetOrder.CUMULATED_AMOUNT)) {
      this.gridDisplay[ConsumptionChartAxis.AMOUNT] = true;
    }
  }

  private getStyleColor(element: Element): string {
    const style = getComputedStyle(element);
    return style && style.color ? style.color : '';
  }

  private prepareOrUpdateGraph() {
    if (this.canDisplayGraph()) {
      this.updateVisibleDatasets();
      this.createGraphData();
      this.refreshDataSets();
      const options = this.createOptions();
      if (!this.graphCreated) {
        this.graphCreated = true;
        this.chart = new Chart(this.chartElement.nativeElement.getContext('2d'), {
          type: 'line',
          data: this.data,
          options,
        });
      } else {
        this.chart.options = options;
      }
      this.chart.update();
    }
  }

  // eslint-disable-next-line complexity
  private createGraphData() {
    const datasets: ChartDataset[] = [];
    // Instant Amps/Power
    datasets.push({
      type: 'line',
      // hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps'))))].hidden,
      hidden:
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS) === -1 &&
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_WATTS) === -1,
      data: [],
      yAxisID:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartAxis.AMPERAGE
          : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.instantPowerAmpsColor),
      label: this.translateService.instant(
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? 'transactions.graph.amps'
          : 'transactions.graph.power'
      ),
      fill: 'origin',
      order:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartDatasetOrder.INSTANT_AMPS
          : ConsumptionChartDatasetOrder.INSTANT_WATTS,
    });
    // Power/Amps L1/L2/L3
    if (
      this.transaction.values.find((consumption) => consumption.instantWattsL1 > 0) ||
      this.transaction.values.find((consumption) => consumption.instantWattsL2 > 0) ||
      this.transaction.values.find((consumption) => consumption.instantWattsL3 > 0)
    ) {
      datasets.push({
        type: 'line',
        data: [],
        hidden:
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS_L1) === -1 &&
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_WATTS_L1) === -1,
        yAxisID:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartAxis.AMPERAGE
            : ConsumptionChartAxis.POWER,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerAmpsL1Color),
        label: this.translateService.instant(
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? 'transactions.graph.amps_l1'
            : 'transactions.graph.power_l1'
        ),
        borderDash: [1, 1],
        fill: 'origin',
        order:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartDatasetOrder.INSTANT_AMPS_L1
            : ConsumptionChartDatasetOrder.INSTANT_WATTS_L1,
      });
      datasets.push({
        type: 'line',
        data: [],
        hidden:
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS_L2) === -1 &&
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_WATTS_L2) === -1,
        yAxisID:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartAxis.AMPERAGE
            : ConsumptionChartAxis.POWER,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerAmpsL2Color),
        label: this.translateService.instant(
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? 'transactions.graph.amps_l2'
            : 'transactions.graph.power_l2'
        ),
        borderDash: [3, 3],
        fill: 'origin',
        order:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartDatasetOrder.INSTANT_AMPS_L2
            : ConsumptionChartDatasetOrder.INSTANT_WATTS_L2,
      });
      datasets.push({
        type: 'line',
        data: [],
        hidden:
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS_L3) === -1 &&
          this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_WATTS_L3) === -1,
        yAxisID:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartAxis.AMPERAGE
            : ConsumptionChartAxis.POWER,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerAmpsL3Color),
        label: this.translateService.instant(
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? 'transactions.graph.amps_l3'
            : 'transactions.graph.power_l3'
        ),
        borderDash: [5, 5],
        fill: 'origin',
        order:
          this.selectedUnit === ConsumptionUnit.AMPERE
            ? ConsumptionChartDatasetOrder.INSTANT_AMPS_L3
            : ConsumptionChartDatasetOrder.INSTANT_WATTS_L3,
      });
    }
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
          : 'transactions.graph.limit_watts'
      ),
      fill: 'origin',
      order:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartDatasetOrder.LIMIT_AMPS
          : ConsumptionChartDatasetOrder.LIMIT_WATTS,
    });
    // Cumulated Amps/Power
    datasets.push({
      type: 'line',
      hidden:
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_AMPS) ===
          -1 &&
        this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH) === -1,
      data: [],
      yAxisID:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartAxis.AMPERAGE
          : ConsumptionChartAxis.POWER,
      lineTension: this.lineTension,
      ...Utils.formatLineColor(this.consumptionColor),
      label: this.translateService.instant(
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? 'transactions.graph.energy_amps'
          : 'transactions.graph.energy'
      ),
      fill: 'origin',
      order:
        this.selectedUnit === ConsumptionUnit.AMPERE
          ? ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_AMPS
          : ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH,
    });
    // Amount
    if (this.transaction.values.find((consumption) => consumption.cumulatedAmount > 0)) {
      datasets.push({
        type: 'line',
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.CUMULATED_AMOUNT) === -1,
        data: [],
        yAxisID: ConsumptionChartAxis.AMOUNT,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.amountColor),
        label: this.translateService.instant('transactions.graph.cumulated_amount'),
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.CUMULATED_AMOUNT,
      });
    }
    // DC Amps
    if (this.transaction.values.find((consumption) => consumption.instantAmpsDC > 0)) {
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_AMPS_DC) === -1,
        yAxisID: ConsumptionChartAxis.AMPERAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantAmpsDCColor),
        label: this.translateService.instant('transactions.graph.amperage_dc'),
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_AMPS_DC,
      });
    }
    // Voltage
    if (this.transaction.values.find((consumption) => consumption.instantVolts > 0)) {
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_VOLTS) === -1,
        yAxisID: ConsumptionChartAxis.VOLTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantVoltsColor),
        label: this.translateService.instant('transactions.graph.voltage'),
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_VOLTS,
      });
    }
    // DC Voltage
    if (this.transaction.values.find((consumption) => consumption.instantVoltsDC > 0)) {
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_VOLTS_DC) === -1,
        yAxisID: ConsumptionChartAxis.VOLTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantVoltsColor),
        label: this.translateService.instant('transactions.graph.voltage_dc'),
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_VOLTS_DC,
      });
    }
    // Voltage L1/L2/L3
    if (
      this.transaction.values.find((consumption) => consumption.instantVoltsL1 > 0) ||
      this.transaction.values.find((consumption) => consumption.instantVoltsL2 > 0) ||
      this.transaction.values.find((consumption) => consumption.instantVoltsL3 > 0)
    ) {
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L1) === -1,
        yAxisID: ConsumptionChartAxis.VOLTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantVoltsL1Color),
        label: this.translateService.instant('transactions.graph.voltage_l1'),
        borderDash: [1, 1],
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_VOLTS_L1,
      });
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L2) === -1,
        yAxisID: ConsumptionChartAxis.VOLTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantVoltsL2Color),
        label: this.translateService.instant('transactions.graph.voltage_l2'),
        borderDash: [3, 3],
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_VOLTS_L2,
      });
      datasets.push({
        type: 'line',
        data: [],
        hidden: this.visibleDatasets.indexOf(ConsumptionChartDatasetOrder.INSTANT_VOLTS_L3) === -1,
        yAxisID: ConsumptionChartAxis.VOLTAGE,
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantVoltsL3Color),
        label: this.translateService.instant('transactions.graph.voltage_l3'),
        borderDash: [5, 5],
        fill: 'origin',
        order: ConsumptionChartDatasetOrder.INSTANT_VOLTS_L3,
      });
    }
    // SoC
    if (
      this.transaction.stateOfCharge > 0 ||
      (this.transaction.stop && this.transaction.stop.stateOfCharge > 0)
    ) {
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
    return this.transaction?.values?.length > 0;
  }

  // eslint-disable-next-line complexity
  private refreshDataSets() {
    this.updateVisibleGridLines();
    for (const key of Object.keys(this.data.datasets)) {
      this.data.datasets[key].data = [];
    }
    const instantPowerDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.INSTANT_WATTS);
    const instantPowerL1DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_WATTS_L1
    );
    const instantPowerL2DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_WATTS_L2
    );
    const instantPowerL3DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_WATTS_L3
    );
    const instantAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.INSTANT_AMPS);
    const instantAmpsL1DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_AMPS_L1
    );
    const instantAmpsL2DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_AMPS_L2
    );
    const instantAmpsL3DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_AMPS_L3
    );
    const instantAmpsDCDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_AMPS_DC
    );
    const cumulatedConsumptionDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH
    );
    const cumulatedConsumptionAmpsDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_AMPS
    );
    const cumulatedAmountDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.CUMULATED_AMOUNT
    );
    const stateOfChargeDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.STATE_OF_CHARGE
    );
    const instantVoltsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.INSTANT_VOLTS);
    const instantVoltsDCDataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_VOLTS_DC
    );
    const instantVoltsL1DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_VOLTS_L1
    );
    const instantVoltsL2DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_VOLTS_L2
    );
    const instantVoltsL3DataSet = this.getDataSetByOrder(
      ConsumptionChartDatasetOrder.INSTANT_VOLTS_L3
    );
    const limitWattsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_WATTS);
    const limitAmpsDataSet = this.getDataSetByOrder(ConsumptionChartDatasetOrder.LIMIT_AMPS);
    const labels: number[] = [];
    for (const consumption of this.transaction.values) {
      labels.push(new Date(consumption.endedAt).getTime());
      if (instantPowerDataSet) {
        if (consumption.instantWattsDC > 0) {
          instantPowerDataSet.push(consumption.instantWattsDC);
        } else {
          instantPowerDataSet.push(consumption.instantWatts);
        }
      }
      if (instantPowerL1DataSet) {
        instantPowerL1DataSet.push(consumption.instantWattsL1);
      }
      if (instantPowerL2DataSet) {
        instantPowerL2DataSet.push(consumption.instantWattsL2);
      }
      if (instantPowerL3DataSet) {
        instantPowerL3DataSet.push(consumption.instantWattsL3);
      }
      if (instantAmpsDataSet) {
        instantAmpsDataSet.push(consumption.instantAmps);
      }
      if (instantAmpsL1DataSet) {
        instantAmpsL1DataSet.push(consumption.instantAmpsL1);
      }
      if (instantAmpsL2DataSet) {
        instantAmpsL2DataSet.push(consumption.instantAmpsL2);
      }
      if (instantAmpsL3DataSet) {
        instantAmpsL3DataSet.push(consumption.instantAmpsL3);
      }
      if (instantAmpsDCDataSet) {
        instantAmpsDCDataSet.push(consumption.instantAmpsDC);
      }
      if (cumulatedConsumptionDataSet) {
        cumulatedConsumptionDataSet.push(consumption.cumulatedConsumptionWh);
      }
      if (cumulatedConsumptionAmpsDataSet) {
        cumulatedConsumptionAmpsDataSet.push(consumption.cumulatedConsumptionAmps);
      }
      if (cumulatedAmountDataSet) {
        cumulatedAmountDataSet.push(consumption.cumulatedAmount);
      }
      if (stateOfChargeDataSet) {
        stateOfChargeDataSet.push(consumption.stateOfCharge);
      }
      if (instantVoltsDataSet) {
        instantVoltsDataSet.push(consumption.instantVolts);
      }
      if (instantVoltsDCDataSet) {
        instantVoltsDCDataSet.push(consumption.instantVoltsDC);
      }
      if (instantVoltsL1DataSet) {
        instantVoltsL1DataSet.push(consumption.instantVoltsL1);
      }
      if (instantVoltsL2DataSet) {
        instantVoltsL2DataSet.push(consumption.instantVoltsL2);
      }
      if (instantVoltsL3DataSet) {
        instantVoltsL3DataSet.push(consumption.instantVoltsL3);
      }
      if (limitWattsDataSet) {
        limitWattsDataSet.push(consumption.limitWatts);
      }
      if (limitAmpsDataSet) {
        limitAmpsDataSet.push(consumption.limitAmps);
      }
    }
    // Add last consumption duration
    this.data.labels = labels;
    this.firstLabel = labels[0];
  }

  private createOptions(): ChartOptions {
    const options: ChartOptions | any = {
      animation: {
        duration: 0,
      },
      responsive: true,
      maintainAspectRatio: false,
      // spanGaps: true,
      // aspectRatio: this.ratio,
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
            legend.chart.options.scales = this.buildScales();
            legend.chart.update();
          },
        },
        tooltip: {
          bodySpacing: 5,
          mode: 'index',
          position: 'nearest',
          multiKeyBackground: Utils.toRgba(this.instantPowerAmpsColor, 0.7),
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
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_WATTS_L1:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L1';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_WATTS_L2:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L2';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_WATTS_L3:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L3';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS_L1:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L1';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS_L2:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L2';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS_L3:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L3';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_AMPS_DC:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A DC';
                  break;
                case ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_WH:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW.h';
                  break;
                case ConsumptionChartDatasetOrder.CUMULATED_CONSUMPTION_AMPS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' A.h';
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_WATTS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW';
                  break;
                case ConsumptionChartDatasetOrder.LIMIT_AMPS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A';
                  break;
                case ConsumptionChartDatasetOrder.STATE_OF_CHARGE:
                  tooltipLabel = ` ${value} %`;
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_VOLTS:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_VOLTS_DC:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V DC';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_VOLTS_L1:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L1';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_VOLTS_L2:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L2';
                  break;
                case ConsumptionChartDatasetOrder.INSTANT_VOLTS_L3:
                  tooltipLabel = ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L3';
                  break;
                case ConsumptionChartDatasetOrder.AMOUNT:
                  tooltipLabel =
                    this.appCurrencyPipe.transform(value, this.transaction.priceUnit) + '';
                  break;
                case ConsumptionChartDatasetOrder.CUMULATED_AMOUNT:
                  tooltipLabel =
                    this.appCurrencyPipe.transform(value, this.transaction.priceUnit) + '';
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
      scales: this.buildScales(),
    };
    return options;
  }

  private buildScales(): any {
    return {
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
          callback: (value: number) =>
            parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + (value < 1000 ? 'W' : 'kW'),
          color: this.defaultColor,
        },
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.POWER],
          color: 'rgba(0,0,0,0.2)',
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
          callback: (value: number) =>
            parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'A',
          color: this.defaultColor,
        },
      },
      [ConsumptionChartAxis.VOLTAGE]: {
        type: 'linear',
        position: 'left',
        display: 'auto',
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.VOLTAGE],
          color: 'rgba(0,0,0,0.2)',
        },
        ticks: {
          callback: (value: number) =>
            parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'V',
          color: this.defaultColor,
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
          callback: (value) => `${value}%`,
          color: this.defaultColor,
        },
      },
      [ConsumptionChartAxis.AMOUNT]: {
        type: 'linear',
        position: 'right',
        display: 'auto',
        min: 0,
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ConsumptionChartAxis.AMOUNT],
          color: 'rgba(0,0,0,0.2)',
        },
        ticks: {
          callback: (value: number) => {
            const result = this.appCurrencyPipe.transform(value, this.transaction.priceUnit);
            return result ? result : '';
          },
          color: this.defaultColor,
        },
      },
    };
  }
}
