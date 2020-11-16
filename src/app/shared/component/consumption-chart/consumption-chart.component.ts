import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartColor, ChartData, ChartDataSets, ChartOptions, ChartTooltipItem } from 'chart.js';
import * as moment from 'moment';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { ConsumptionUnit, Transaction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { AppDatePipe } from '../../formatters/app-date.pipe';
import { AppDecimalPipe } from '../../formatters/app-decimal-pipe';

@Component({
  selector: 'app-transaction-chart',
  templateUrl: 'consumption-chart.component.html',
})
export class ConsumptionChartComponent implements AfterViewInit {
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
  private data: ChartData = {
    labels: [],
    datasets: [],
  };
  private options!: ChartOptions;
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
  private language!: string;
  private activeLegend = [
    { key: this.translateService.instant('transactions.graph.amps') + this.translateService.instant('transactions.graph.power'), hidden: false },
    { key: this.translateService.instant('transactions.graph.amps_l1') + this.translateService.instant('transactions.graph.power_l1'), hidden: true },
    { key: this.translateService.instant('transactions.graph.amps_l2') + this.translateService.instant('transactions.graph.power_l2'), hidden: true },
    { key: this.translateService.instant('transactions.graph.amps_l3') + this.translateService.instant('transactions.graph.power_l3'), hidden: true },
    { key: this.translateService.instant('transactions.graph.limit_amps') + this.translateService.instant('transactions.graph.limit_watts'), hidden: this.authorizationService.isAdmin() ? false : true },
    { key: this.translateService.instant('transactions.graph.energy_amps') + this.translateService.instant('transactions.graph.energy'), hidden: true },
    { key: this.translateService.instant('transactions.graph.cumulated_amount'), hidden: true },
    { key: this.translateService.instant('transactions.graph.amperage_dc'), hidden: true },
    { key: this.translateService.instant('transactions.graph.voltage'), hidden: true },
    { key: this.translateService.instant('transactions.graph.voltage_dc'), hidden: true },
    { key: this.translateService.instant('transactions.graph.voltage_l1'), hidden: true },
    { key: this.translateService.instant('transactions.graph.voltage_l2'), hidden: true },
    { key: this.translateService.instant('transactions.graph.voltage_l3'), hidden: true },
    { key: this.translateService.instant('transactions.graph.battery'), hidden: false }
  ];

  constructor(
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private localeService: LocaleService,
    private datePipe: AppDatePipe,
    private durationPipe: AppDurationPipe,
    private decimalPipe: AppDecimalPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private authorizationService: AuthorizationService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.language = locale.language;
    });
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
    this.centralServerService.getTransactionConsumption(this.transactionId, this.loadAllConsumptions)
      .subscribe((transaction) => {
        this.transaction = transaction;
        this.prepareOrUpdateGraph();
      }, (error) => {
        delete this.transaction;
      });
  }

  public loadAllConsumptionsChanged(matCheckboxChange: MatCheckboxChange) {
    if (matCheckboxChange) {
      this.loadAllConsumptions = matCheckboxChange.checked;
      this.refresh();
    }
  }

  public unitChanged(key: ConsumptionUnit) {
    this.selectedUnit = key;
    this.prepareOrUpdateGraph();
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
          type: 'bar',
          data: this.data,
          options: this.options,
        });
      }
      this.createGraphData();
      this.refreshDataSets();
      this.chart.update();
    }
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private createGraphData() {
    if (this.data.datasets && this.options.scales && this.options.scales.yAxes) {
      const datasets: ChartDataSets[] = [];
      // Instant Amps/Power
      datasets.push({
        name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'instantAmps' : 'instantWatts',
        type: 'line',
        hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps'))))].hidden,
        data: [],
        yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.instantPowerAmpsColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.amps' : 'transactions.graph.power'),
      });
      // Power/Amps L1/L2/L3
      if (this.transaction.values.find((consumption) => consumption.instantWattsL1 > 0) ||
        this.transaction.values.find((consumption) => consumption.instantWattsL2 > 0) ||
        this.transaction.values.find((consumption) => consumption.instantWattsL3 > 0)) {
        datasets.push({
          name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'instantAmpsL1' : 'instantWattsL1',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps_l1'))))].hidden,
          yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantPowerAmpsL1Color),
          label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
            'transactions.graph.amps_l1' : 'transactions.graph.power_l1'),
        });
        datasets.push({
          name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'instantAmpsL2' : 'instantWattsL2',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps_l2'))))].hidden,
          yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantPowerAmpsL2Color),
          label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
            'transactions.graph.amps_l2' : 'transactions.graph.power_l2'),
        });
        datasets.push({
          name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'instantAmpsL3' : 'instantWattsL3',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amps_l3'))))].hidden,
          yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantPowerAmpsL3Color),
          label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
            'transactions.graph.amps_l3' : 'transactions.graph.power_l3'),
        });
      }
      // Limit Amps/Power
      datasets.push({
        name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'limitAmps' : 'limitWatts',
        type: 'line',
        hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.limit_amps'))))].hidden,
        data: [],
        yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.limitColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.limit_amps' : 'transactions.graph.limit_watts'),
      });
      // Cumulated Amps/Power
      datasets.push({
        name: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'cumulatedConsumptionAmps' : 'cumulatedConsumptionWh',
        type: 'line',
        hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.energy_amps'))))].hidden,
        data: [],
        yAxisID: (this.selectedUnit === ConsumptionUnit.AMPERE) ? 'amperage' : 'power',
        lineTension: this.lineTension,
        ...Utils.formatLineColor(this.consumptionColor),
        label: this.translateService.instant((this.selectedUnit === ConsumptionUnit.AMPERE) ?
          'transactions.graph.energy_amps' : 'transactions.graph.energy'),
      });
      // Amount
      if (this.transaction.values.find((consumption) => consumption.cumulatedAmount > 0)) {
        datasets.push({
          name: 'cumulatedAmount',
          type: 'line',
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.cumulated_amount'))))].hidden,
          data: [],
          yAxisID: 'amount',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.amountColor),
          label: this.translateService.instant('transactions.graph.cumulated_amount'),
        });
      }
      // DC Amps
      if (this.transaction.values.find((consumption) => consumption.instantAmpsDC > 0)) {
        datasets.push({
          name: 'instantAmpsDC',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.amperage_dc'))))].hidden,
          yAxisID: 'amperage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantAmpsDCColor),
          label: this.translateService.instant('transactions.graph.amperage_dc'),
        });
      }
      // Voltage
      if (this.transaction.values.find((consumption) => consumption.instantVolts > 0)) {
        datasets.push({
          name: 'instantVolts',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.voltage'))))].hidden,
          yAxisID: 'voltage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantVoltsColor),
          label: this.translateService.instant('transactions.graph.voltage'),
        });
      }
      // DC Voltage
      if (this.transaction.values.find((consumption) => consumption.instantVoltsDC > 0)) {
        datasets.push({
          name: 'instantVoltsDC',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.voltage_dc'))))].hidden,
          yAxisID: 'voltage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantVoltsColor),
          label: this.translateService.instant('transactions.graph.voltage_dc'),
        });
      }
      // Voltage L1/L2/L3
      if (this.transaction.values.find((consumption) => consumption.instantVoltsL1 > 0) ||
        this.transaction.values.find((consumption) => consumption.instantVoltsL2 > 0) ||
        this.transaction.values.find((consumption) => consumption.instantVoltsL3 > 0)) {
        datasets.push({
          name: 'instantVoltsL1',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.voltage_l1'))))].hidden,
          yAxisID: 'voltage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantVoltsL1Color),
          label: this.translateService.instant('transactions.graph.voltage_l1'),
        });
        datasets.push({
          name: 'instantVoltsL2',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.voltage_l2'))))].hidden,
          yAxisID: 'voltage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantVoltsL2Color),
          label: this.translateService.instant('transactions.graph.voltage_l2'),
        });
        datasets.push({
          name: 'instantVoltsL3',
          type: 'line',
          data: [],
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.voltage_l3'))))].hidden,
          yAxisID: 'voltage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.instantVoltsL3Color),
          label: this.translateService.instant('transactions.graph.voltage_l3'),
        });
      }
      // SoC
      if (this.transaction.stateOfCharge > 0 || (this.transaction.stop && this.transaction.stop.stateOfCharge > 0)) {
        datasets.push({
          name: 'stateOfCharge',
          type: 'line',
          hidden: this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(this.translateService.instant('transactions.graph.battery'))))].hidden,
          data: [],
          yAxisID: 'percentage',
          lineTension: this.lineTension,
          ...Utils.formatLineColor(this.stateOfChargeColor),
          label: this.translateService.instant('transactions.graph.battery'),
        });
      }
      // Assign
      this.data.labels = [];
      this.data.datasets = datasets;
    }
  }

  private getDataSet(name: string): number[] {
    if (this.data.datasets) {
      const dataSet = this.data.datasets.find((d) => (d as any).name === name);
      return dataSet ? dataSet.data as number[] : [];
    }
    return [];
  }

  private canDisplayGraph() {
    return this.transaction && this.transaction.values && this.transaction.values.length > 0;
  }

  // tslint:disable-next-line: cyclomatic-complexity
  private refreshDataSets() {
    if (this.data.datasets) {
      for (const key of Object.keys(this.data.datasets)) {
        this.data.datasets[key].data = [];
      }
      const instantPowerDataSet = this.getDataSet('instantWatts');
      const instantPowerL1DataSet = this.getDataSet('instantWattsL1');
      const instantPowerL2DataSet = this.getDataSet('instantWattsL2');
      const instantPowerL3DataSet = this.getDataSet('instantWattsL3');
      const instantAmpsDataSet = this.getDataSet('instantAmps');
      const instantAmpsL1DataSet = this.getDataSet('instantAmpsL1');
      const instantAmpsL2DataSet = this.getDataSet('instantAmpsL2');
      const instantAmpsL3DataSet = this.getDataSet('instantAmpsL3');
      const instantAmpsDCDataSet = this.getDataSet('instantAmpsDC');
      const cumulatedConsumptionDataSet = this.getDataSet('cumulatedConsumptionWh');
      const cumulatedConsumptionAmpsDataSet = this.getDataSet('cumulatedConsumptionAmps');
      const cumulatedAmountDataSet = this.getDataSet('cumulatedAmount');
      const stateOfChargeDataSet = this.getDataSet('stateOfCharge');
      const instantVoltsDataSet = this.getDataSet('instantVolts');
      const instantVoltsDCDataSet = this.getDataSet('instantVoltsDC');
      const instantVoltsL1DataSet = this.getDataSet('instantVoltsL1');
      const instantVoltsL2DataSet = this.getDataSet('instantVoltsL2');
      const instantVoltsL3DataSet = this.getDataSet('instantVoltsL3');
      const limitWattsDataSet = this.getDataSet('limitWatts');
      const limitAmpsDataSet = this.getDataSet('limitAmps');
      const labels: number[] = [];
      // Add last point
      if (this.transaction.values.length > 0) {
        this.transaction.values.push({
          ...this.transaction.values[this.transaction.values.length - 1],
          startedAt: this.transaction.values[this.transaction.values.length - 1].endedAt,
        });
      }
      for (const consumption of this.transaction.values) {
        labels.push(new Date(consumption.startedAt).getTime());
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
    }
  }

  private createOptions(): ChartOptions {
    const locale = moment.localeData(this.language);
    const options: ChartOptions = {
      animation: {
        duration: 0,
      },
      legend: {
        position: 'bottom',
        labels: {
          fontColor: this.defaultColor,
        },
        onClick: (e, legendItem) => {
          const index = legendItem.datasetIndex;
          const ci = this.chart;
          const meta = ci.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          this.activeLegend[this.activeLegend.findIndex((x => x.key.includes(legendItem.text)))].hidden = meta.hidden;
          ci.update();
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      // aspectRatio: this.ratio,
      tooltips: {
        bodySpacing: 5,
        mode: 'index',
        position: 'nearest',
        multiKeyBackground: Utils.toRgba(this.instantPowerAmpsColor, 0.7),
        intersect: false,
        callbacks: {
          labelColor: (tooltipItem: ChartTooltipItem, chart: Chart) => {
            return {
              borderColor: 'rgba(0,0,0,0)',
              backgroundColor: this.data.datasets && tooltipItem.datasetIndex ?
                this.data.datasets[tooltipItem.datasetIndex].borderColor as ChartColor : '',
            };
          },
          // tslint:disable-next-line: cyclomatic-complexity
          label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
            if (this.data.datasets && data.datasets && !Utils.isUndefined(tooltipItem.datasetIndex)) {
              const dataSet = data.datasets[tooltipItem.datasetIndex];
              if (dataSet && dataSet.data && !Utils.isUndefined(tooltipItem.index)) {
                const value = dataSet.data[tooltipItem.index] as number;
                switch (this.data.datasets[tooltipItem.datasetIndex]['name']) {
                  case 'instantWatts':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW';
                  case 'instantWattsL1':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L1';
                  case 'instantWattsL2':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L2';
                  case 'instantWattsL3':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW L3';
                  case 'instantAmps':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A';
                  case 'instantAmpsL1':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L1';
                  case 'instantAmpsL2':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L2';
                  case 'instantAmpsL3':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A L3';
                  case 'instantAmpsDC':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A DC';
                  case 'cumulatedConsumptionWh':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW.h';
                  case 'cumulatedConsumptionAmps':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' A.h';
                  case 'limitWatts':
                    return ' ' + this.decimalPipe.transform(value / 1000, '1.0-2') + ' kW';
                  case 'limitAmps':
                    return ' ' + this.decimalPipe.transform(value, '1.0-0') + ' A';
                  case 'stateOfCharge':
                    return ` ${value} %`;
                  case 'instantVolts':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V';
                  case 'instantVoltsDC':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V DC';
                  case 'instantVoltsL1':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L1';
                  case 'instantVoltsL2':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L2';
                  case 'instantVoltsL3':
                    return ' ' + this.decimalPipe.transform(value, '1.0-2') + ' V L3';
                  case 'amount':
                    return this.appCurrencyPipe.transform(value, this.transaction.priceUnit) + '';
                  case 'cumulatedAmount':
                    return this.appCurrencyPipe.transform(value, this.transaction.priceUnit) + '';
                  default:
                    return value + '';
                }
              }
            }
            return '';
          },
          title: (item: ChartTooltipItem[], data: ChartData) => {
            if (data.labels && data.labels.length > 0) {
              const firstDate = new Date(data.labels[0] as number);
              if (!Utils.isUndefined(item[0].index)) {
                const currentDate = new Date(data.labels[item[0].index] as number);
                return this.datePipe.transform(currentDate) + ' - ' +
                  this.durationPipe.transform((currentDate.getTime() - firstDate.getTime()) / 1000);
              }
            }
            return '';
          },
        },
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            distribution: 'linear',
            time: {
              tooltipFormat: locale.longDateFormat('LT'),
              unit: 'minute',
              displayFormats: {
                second: locale.longDateFormat('LTS'),
                minute: locale.longDateFormat('LT'),
              },
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 40,
              fontColor: this.defaultColor,
            },
          },
        ],
        yAxes: [
          {
            id: 'power',
            type: 'linear',
            position: 'left',
            display: 'auto',
            ticks: {
              beginAtZero: true,
              callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0')) + ((value < 1000) ? 'W' : 'kW'),
              fontColor: this.defaultColor,
              min: 0,
            },
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
          },
          {
            id: 'amperage',
            type: 'linear',
            position: 'left',
            display: 'auto',
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0')) + 'A',
              min: 0,
              fontColor: this.defaultColor,
            },
          },
          {
            id: 'voltage',
            type: 'linear',
            position: 'left',
            display: 'auto',
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0')) + 'V',
              min: 0,
              fontColor: this.defaultColor,
            },
          },
          {
            id: 'percentage',
            type: 'linear',
            position: 'right',
            display: 'auto',
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              callback: (value) => `${value}%`,
              fontColor: this.defaultColor,
            },
          },
          {
            id: 'amount',
            type: 'linear',
            position: 'right',
            display: 'auto',
            gridLines: {
              display: true,
              color: 'rgba(0,0,0,0.2)',
            },
            ticks: {
              callback: (value: number) => {
                const result = this.appCurrencyPipe.transform(value, this.transaction.priceUnit);
                return result ? result : '';
              },
              min: 0,
              fontColor: this.defaultColor,
            },
          }
        ],
      },
    };
    return options;
  }
}
