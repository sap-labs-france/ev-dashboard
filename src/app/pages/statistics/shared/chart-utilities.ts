import { ElementRef } from '@angular/core';
import { Chart, ChartData, ChartOptions } from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';

export class ChartConstants {
  public static STACKED_ITEM = 'item';
  public static STACKED_TOTAL = 'total';
}

export { ChartData } from 'chart.js'; // could also use any local, but similar data definition!

export class SimpleChart {
  private chart: Chart;
  private chartType: string;
  private stackedChart = false;
  private chartOptions: ChartOptions;
  private chartData: ChartData;
  private roundedLabels: boolean;
  private constLabelSize = 20;
  private constMinDivisorBar = 40;
  private constMinDivisorPie = 40;
  private itemsHidden = false;
  private language: string;

  constructor(language: string, chartType: 'bar' | 'stackedBar' | 'pie', mainLabel: string, toolTipUnit?: string,
    labelXAxis?: string, labelYAxis?: string, roundedLabels = true, withLegend = false) {

    // Unregister global activation of Chart labels
    Chart.plugins.unregister(ChartDataLabels);

    this.language = language;

    switch (chartType) {
      case 'pie':
        this.createPieChartOptions(mainLabel, toolTipUnit, roundedLabels, withLegend);
        break;
      case 'bar':
        this.createBarChartOptions(false, mainLabel, toolTipUnit, labelXAxis, labelYAxis, roundedLabels, withLegend);
        break;
      case 'stackedBar':
        this.createBarChartOptions(true, mainLabel, toolTipUnit, labelXAxis, labelYAxis, roundedLabels, withLegend);
    }
  }

  public initChart(context: ElementRef): void {
    this.chart = new Chart(context.nativeElement.getContext('2d'), {
      type: this.chartType,
      plugins: [ChartDataLabels],
      options: this.chartOptions,
      data: { labels: [], datasets: [] }
    })
  }

  public updateChart(chartData: ChartData, mainLabel?: string): void {
    let anyChart: any;

    this.updateChartOptions(chartData, mainLabel);
    this.updateChartData(chartData);
    this.chart.data = this.chartData;
    anyChart = this.chart; // type Chart does not know 'options'
    anyChart.options = this.chartOptions;
    this.chart = anyChart;
    this.chart.update();

  }

  public toggleHideItems() {
    this.itemsHidden = !this.itemsHidden;

    if (this.stackedChart) {
      this.chartData.datasets.forEach((dataset) => {
        if (dataset.stack !== ChartConstants.STACKED_TOTAL) {
          dataset.hidden = this.itemsHidden;
        }
      })
    } else {
      const meta = this.chart.getDatasetMeta(0);
      meta.data.forEach((object) => {
        object.hidden = this.itemsHidden;
      });
    }

    this.chart.update();
  }

  private createBarChartOptions(stacked: boolean, mainLabel: string, toolTipUnit: string, labelXAxis: string, labelYAxis: string,
    roundedLabels: boolean, withLegend: boolean): void {
    this.chartType = 'bar';
    this.stackedChart = stacked;
    this.roundedLabels = roundedLabels;

    this.chartOptions = {};

    this.chartOptions['title'] = {
      display: true,
      text: mainLabel,
      fontStyle: 'bold',
      fontSize: this.constLabelSize
    };

    this.chartOptions['legend'] = {
      display: withLegend,
      position: 'bottom'
    };

    this.chartOptions['plugins'] = {};
    this.chartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        return context.dataset.data[context.dataIndex] > 0
      }
    };

    this.chartOptions['animation'] = {
      duration: 2000,
      easing: 'easeOutBounce'
    };

    this.chartOptions['tooltips'] = {
      enabled: true,
      callbacks: {
        label: (tooltipItem, data) => {
          let number = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          let toolTip: string;

          if (this.roundedLabels &&
            typeof (number) === 'number') {
            number = Math.round(number);
          }
          if (this.stackedChart) {
            toolTip = data.datasets[tooltipItem.datasetIndex].label
              + ' : ' + number.toLocaleString(this.language);
          } else {
            toolTip = number.toLocaleString(this.language);
          }
          if (toolTipUnit) {
            toolTip = toolTip + ` ${toolTipUnit}`;
          }
          return toolTip
        }
      }
    };

    this.chartOptions['scales'] = {
      xAxes:
        [{
          stacked: stacked,
          scaleLabel: {
            display: true,
            labelString: labelXAxis,
            fontStyle: 'bold'
          }
        }],
      yAxes:
        [{
          stacked: stacked,
          scaleLabel: {
            display: true,
            labelString: labelYAxis,
            fontStyle: 'bold'
          },
          ticks: {
            beginAtZero: true,
            callback: (value, index, values) => {
              return value.toLocaleString(this.language);
            }
          }
        }]
    }
  }

  private createPieChartOptions(mainLabel: string, toolTipUnit: string, roundedLabels: boolean, withLegend: boolean): void {
    this.chartType = 'pie';
    this.roundedLabels = roundedLabels;

    this.chartOptions = {};

    this.chartOptions['title'] = {
      display: true,
      text: mainLabel,
      fontStyle: 'bold',
      fontSize: this.constLabelSize
    };

    this.chartOptions['legend'] = {
      display: withLegend,
      position: 'bottom'
    };

    this.chartOptions['plugins'] = {};
    this.chartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        return context.dataset.data[context.dataIndex] > 0
      },
    };

    this.chartOptions['animation'] = {
      duration: 2000,
      easing: 'easeOutBounce'
    };

    this.chartOptions['tooltips'] = {
      enabled: true,
      callbacks: {
        label: (tooltipItem, data) => {
          let number = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          let toolTip: string;

          if (this.roundedLabels &&
            typeof (number) === 'number') {
            number = Math.round(number);
          }
          toolTip = data.labels[tooltipItem.index] + ' : '
            + number.toLocaleString(this.language);

          if (toolTipUnit) {
            toolTip = toolTip + ` ${toolTipUnit}`;
          }
          return toolTip
        }
      }
    };
  }

  private updateChartOptions(chartData: ChartData, mainLabel: string): void {
    let minValue = 0;
    let number: any;
    let minDivisor = number;

    if (mainLabel) {
      this.chartOptions.title.text = mainLabel;
    }

    if (this.chartType === 'pie') {
      minDivisor = this.constMinDivisorPie;
    } else {
      minDivisor = this.constMinDivisorBar;
    }

    if (this.stackedChart) {
      chartData.datasets.forEach((dataset) => {
        if (Array.isArray(dataset.data) === true &&
          dataset.stack === ChartConstants.STACKED_TOTAL) {
          for (let i = 0; i < dataset.data.length; i++) {
            number = dataset.data[i];
            if (typeof (number) === 'number') {
              if (number > minValue) {
                minValue = number
              }
            }
          }
        }
      });
      minValue = minValue / minDivisor;
    } else {
      chartData.datasets.forEach((dataset) => {
        if (Array.isArray(dataset.data) === true) {
          for (let i = 0; i < dataset.data.length; i++) {
            number = dataset.data[i];
            if (typeof (number) === 'number') {
              minValue = minValue + number;
            }
          }
        }
      });
      minValue = minValue / minDivisor;
    }

    this.chartOptions['plugins']['datalabels'] = {
      color: 'black',
      display: (context) => {
        return context.dataset.data[context.dataIndex] > minValue
      },
      //  font: { weight: 'bold' },
      formatter: (value, context) => {
        if (this.roundedLabels) {
          return Math.round(value).toLocaleString(this.language);
        } else {
          return value.toLocaleString(this.language);
        }
      }
    };
  }

  private updateChartData(chartData: ChartData) {
    let countData = 0;

    this.chartData = chartData;

    if (!this.chartData.labels) {
      this.chartData.labels = [];
    }

    if (!this.chartData.datasets) {
      this.chartData.datasets = [];
    }

    if (this.stackedChart) {
      chartData.datasets.forEach((dataset) => {
        if (dataset.stack === ChartConstants.STACKED_TOTAL) {
          dataset.hidden = false;
          dataset.backgroundColor = 'lightgrey';
          dataset.borderWidth = 0;
        } else {
          dataset.stack = ChartConstants.STACKED_ITEM; // to be sure
          dataset.hidden = false;
          dataset.backgroundColor = this.getColorCode(countData);
          countData++;
          dataset.borderWidth = 0;
        }
      });
    } else {
      chartData.datasets.forEach((dataset) => {
        dataset.hidden = false;
        dataset.backgroundColor = [];
        for (let i = 0; i < dataset.data.length; i++) {
          dataset.backgroundColor.push(this.getColorCode(i));
        }

        dataset.borderWidth = 0;
      });
    }
  }

  private getColorCode(counter: number) {
    const colors = [
      [144, 238, 144, 0.8],
      [255, 165, 0, 0.5],
      [135, 206, 235, 0.8],
      [222, 184, 135, 0.5],
      [255, 182, 193, 0.8],
      [102, 205, 170, 0.5],
      [255, 160, 122, 0.8],
      [70, 130, 180, 0.5],
      [255, 222, 173, 0.8],
      [218, 112, 214, 0.5],
      [144, 238, 144, 0.5],
      [255, 165, 0, 0.8],
      [135, 206, 235, 0.5],
      [222, 184, 135, 0.8],
      [255, 182, 193, 0.5],
      [102, 205, 170, 0.8],
      [255, 160, 122, 0.5],
      [70, 130, 180, 0.8],
      [255, 222, 173, 0.5],
      [218, 112, 214, 0.8]
    ];

    const div20 = counter % 20;
    return `rgba(${colors[div20][0]}, ${colors[div20][1]}, ${colors[div20][2]}, ${colors[div20][3]})`
  }
}
