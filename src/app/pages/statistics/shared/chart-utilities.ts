/* eslint-disable no-underscore-dangle */
import { ElementRef } from '@angular/core';
import { Chart, ChartData, ChartDataset, ChartOptions, ChartType } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Font } from 'chartjs-plugin-datalabels/types/options';
import { ChartTypeValues } from 'types/Chart';
import { Utils } from 'utils/Utils';

export class ChartConstants {
  public static STACKED_ITEM = 'item';
  public static STACKED_TOTAL = 'total';
}

export class SimpleChart {
  private chart: Chart;
  private chartType: ChartType;
  private stackedChart = false;
  private chartOptions: ChartOptions;
  private chartData: ChartData;
  private roundedChartLabels: boolean;
  private constMinDivisorBar = 40;
  private constMinDivisorPie = 40;
  private labelXAxis: string;
  private labelYAxis: string;
  private toolTipUnit: string;
  private withLegend = false;
  private itemsHidden = false;

  private language: string;
  private contextElement: ElementRef;
  private fontColor: string;
  private inversedFontColor: string;
  private fontSize: string;
  private fontSizeNumber: number;
  private fontFamily: string;
  private font: Font;

  public constructor(
    language: string,
    chartType: ChartTypeValues,
    mainLabel: string,
    labelXAxis?: string,
    labelYAxis?: string,
    toolTipUnit?: string,
    withLegend = false,
    roundedChartLabels = true
  ) {
    Chart.register(ChartDataLabels);
    // Unregister global activation of Chart labels
    // Chart.plugins.unregister(ChartDataLabels);
    // Chart.Tooltip.positioners.customBar = (elements, eventPosition) => {
    //   // Put the tooltip at the center of the selected bar (or bar section), and not at the top:
    //   // @param elements {Chart.Element[]} the tooltip elements
    //   // @param eventPosition {Point} the position of the event in canvas coordinates
    //   // @returns {Point} the tooltip position
    //   let yOffset = 0;
    //   let sum = 0;
    //   const dataSets = elements[0]._chart.data.datasets;
    //   if (Array.isArray(dataSets)) {
    //     if (dataSets.length === 1) {
    //       yOffset = (elements[0]._chart.scales['y-axis-0'].bottom - elements[0]._model.y) / 2;
    //     } else {
    //       for (let i = 0; i < dataSets.length; i++) {
    //         if (i <= elements[0]._datasetIndex &&
    //           dataSets[i].stack === dataSets[elements[0]._datasetIndex].stack) {
    //           sum += dataSets[i].data[elements[0]._index];
    //         }
    //       }
    //       if (sum === 0) {
    //         yOffset = (elements[0]._chart.scales['y-axis-0'].bottom - elements[0]._model.y) / 2;
    //       } else {
    //         yOffset = dataSets[elements[0]._datasetIndex].data[elements[0]._index] / sum;
    //         yOffset *= (elements[0]._chart.scales['y-axis-0'].bottom - elements[0]._model.y) / 2;
    //       }
    //     }
    //   }

    //   return {
    //     x: elements[0]._model.x,
    //     y: elements[0]._model.y + yOffset,
    //   };
    // };

    this.language = language;

    switch (chartType) {
      case ChartTypeValues.PIE:
        this.createPieChartOptions(mainLabel, toolTipUnit, withLegend, roundedChartLabels);
        break;
      case ChartTypeValues.BAR:
        this.createBarChartOptions(
          false,
          mainLabel,
          labelXAxis,
          labelYAxis,
          toolTipUnit,
          withLegend,
          roundedChartLabels
        );
        break;
      case ChartTypeValues.STACKED_BAR:
        this.createBarChartOptions(
          true,
          mainLabel,
          labelXAxis,
          labelYAxis,
          toolTipUnit,
          withLegend,
          roundedChartLabels
        );
    }
  }

  public initChart(context: ElementRef): void {
    this.contextElement = context;
    this.chart = new Chart(this.contextElement.nativeElement.getContext('2d'), {
      type: this.chartType,
      plugins: [ChartDataLabels],
      options: this.chartOptions,
      data: { labels: [], datasets: [] },
    });
  }

  public updateChart(
    chartData: ChartData,
    mainLabel?: string,
    toolTipUnit?: string,
    labelYAxis?: string
  ): void {
    let anyChart: any;
    if (this.chartType === ChartTypeValues.PIE) {
      if (toolTipUnit) {
        this.createPieChartOptions(
          mainLabel,
          toolTipUnit,
          this.withLegend,
          this.roundedChartLabels
        );
      }
    } else {
      if (labelYAxis || toolTipUnit) {
        this.labelYAxis = labelYAxis;
        this.toolTipUnit = toolTipUnit;
        this.createBarChartOptions(
          this.stackedChart,
          mainLabel,
          this.labelXAxis,
          this.labelYAxis,
          this.toolTipUnit,
          this.withLegend,
          this.roundedChartLabels
        );
      }
    }
    this.fontColor = getComputedStyle(this.contextElement.nativeElement).color;
    if (!this.fontColor || Utils.isEmptyString(this.fontColor)) {
      this.fontColor = '#000';
    }
    this.inversedFontColor = this.inverseColor(this.fontColor, true);
    this.fontFamily = getComputedStyle(this.contextElement.nativeElement).fontFamily;
    if (!this.fontFamily || Utils.isEmptyString(this.fontFamily)) {
      this.fontFamily = 'Roboto, "Helvetica Neue", sans-serif';
    }
    this.font = { family: this.fontFamily };
    this.fontSize = getComputedStyle(this.contextElement.nativeElement).fontSize;
    if (!this.fontSize || Utils.isEmptyString(this.fontSize) || !this.fontSize.endsWith('px')) {
      this.fontSize = '20px';
      this.fontSizeNumber = 20;
    } else {
      this.fontSizeNumber = parseInt(this.fontSize, 10);
    }
    if (chartData) {
      this.updateChartOptions(chartData, mainLabel);
      this.updateChartData(chartData);
      this.chart.data = this.chartData;
      anyChart = this.chart; // type Chart does not know 'options'
      anyChart.options = this.chartOptions;
      this.chart = anyChart;
      this.chart.update();
    }
  }

  public showLegend(withUpdate: boolean = false) {
    if (!this.withLegend) {
      this.toggleHideLegend(withUpdate);
    }
  }

  public hideLegend(withUpdate: boolean = false) {
    if (this.withLegend) {
      this.toggleHideLegend(withUpdate);
    }
  }

  public toggleHideLegend(withUpdate: boolean = true) {
    this.withLegend = !this.withLegend;
    this.chartOptions.plugins.legend.display = this.withLegend;
    const anyChart = this.chart; // type Chart does not know 'options'
    anyChart.options = this.chartOptions;
    this.chart = anyChart;
    if (withUpdate) {
      this.chart.update();
    }
  }

  public toggleHideItems() {
    this.itemsHidden = !this.itemsHidden;
    if (this.stackedChart) {
      this.chartData.datasets.forEach((dataset) => {
        if (dataset.stack !== ChartConstants.STACKED_TOTAL) {
          dataset.hidden = this.itemsHidden;
        }
      });
    } else {
      const meta = this.chart.getDatasetMeta(0);
      // meta.data.forEach((object) => {
      //   object.hidden = this.itemsHidden;
      // });
    }
    this.chart.update();
  }

  public cloneChartData(chartData: ChartData, withZeroAmounts = false): ChartData {
    // cloning needed to display the same chart again (with animation)
    let newChartData: ChartData;
    let numberArray: number[];
    let anyArray: any[];
    if (chartData && chartData.datasets && chartData.labels) {
      newChartData = { labels: [], datasets: [] };
      newChartData.labels = chartData.labels.slice();
      const datasets: ChartDataset[] = [];
      chartData.datasets.forEach((dataset) => {
        numberArray = [];
        anyArray = [];
        if (withZeroAmounts) {
          numberArray.fill(0, 0, dataset.data.length);
          anyArray = numberArray;
        } else {
          anyArray = dataset.data.slice();
        }
        if (dataset.stack) {
          datasets.push({ label: dataset.label, data: anyArray, stack: dataset.stack });
        } else {
          datasets.push({ data: anyArray });
        }
      });
      newChartData.datasets = datasets;
      this.updateChartData(newChartData);
    }
    return newChartData;
  }

  private createBarChartOptions(
    stacked: boolean,
    mainLabel: string,
    labelXAxis: string,
    labelYAxis: string,
    toolTipUnit: string,
    withLegend: boolean,
    roundedChartLabels: boolean
  ): void {
    this.chartType = 'bar';
    this.stackedChart = stacked;
    this.labelXAxis = labelXAxis;
    this.labelYAxis = labelYAxis;
    this.toolTipUnit = toolTipUnit;
    this.withLegend = withLegend;
    this.roundedChartLabels = roundedChartLabels;
    this.chartOptions = {
      plugins: {},
    };
    this.chartOptions.plugins.title = {
      display: true,
      text: mainLabel,
      font: {
        weight: 'bold',
      },
    };
    this.chartOptions.plugins.legend = {
      display: withLegend,
      labels: {},
      position: 'bottom',
    };
    this.chartOptions.plugins = {};
    this.chartOptions.plugins.datalabels = {
      display: (context) => context.dataset.data[context.dataIndex] > 0,
    };
    this.chartOptions.animation = {
      duration: 2000,
      easing: 'easeOutBounce',
    };
    this.chartOptions.plugins.tooltip = {
      enabled: true,
      position: 'average',
      callbacks: {
        label: (context) => {
          let value = context.dataset.data[context.dataIndex];
          let toolTip: string;

          if (this.roundedChartLabels && typeof value === 'number') {
            value = Math.round(value);
          }
          if (this.stackedChart) {
            toolTip = `${context.dataset.label} : ${value.toLocaleString(this.language)}`;
          } else {
            toolTip = value.toLocaleString(this.language);
          }
          if (toolTipUnit) {
            toolTip = toolTip + ` ${toolTipUnit}`;
          }
          return toolTip;
        },
      },
    };
    this.chartOptions.scales = {
      x: {
        stacked,
        title: {
          display: true,
          text: labelXAxis,
          font: {
            weight: 'bold',
          },
        },
        ticks: {},
      },
      y: {
        stacked,
        title: {
          display: true,
          text: labelYAxis,
          font: {
            weight: 'bold',
          },
        },
        beginAtZero: true,
        ticks: {
          callback: (value, index, values) => value.toLocaleString(this.language),
        },
      },
    };
  }

  private createPieChartOptions(
    mainLabel: string,
    toolTipUnit: string,
    withLegend: boolean,
    roundedChartLabels: boolean
  ): void {
    this.chartType = ChartTypeValues.PIE;
    this.toolTipUnit = toolTipUnit;
    this.withLegend = withLegend;
    this.roundedChartLabels = roundedChartLabels;
    this.chartOptions = {
      plugins: {},
    };
    this.chartOptions.plugins.title = {
      display: true,
      text: mainLabel,
      font: {
        weight: 'bold',
      },
    };
    this.chartOptions.plugins.legend = {
      display: withLegend,
      labels: {},
      position: 'bottom',
    };
    this.chartOptions.plugins = {};
    this.chartOptions.plugins.datalabels = {
      display: (context) => context.dataset.data[context.dataIndex] > 0,
    };
    this.chartOptions.animation = {
      duration: 2000,
      easing: 'easeOutBounce',
    };
    this.chartOptions.plugins.tooltip = {
      enabled: true,
      callbacks: {
        label: (context) => {
          let value = context.dataset.data[context.dataIndex];
          let toolTip: string;

          if (this.roundedChartLabels && typeof value === 'number') {
            value = Math.round(value);
          }

          toolTip = `${context.label} : ${value.toLocaleString(this.language)}`;

          if (toolTipUnit) {
            toolTip = toolTip + ` ${toolTipUnit}`;
          }
          return toolTip;
        },
      },
    };
  }

  private updateChartOptions(
    chartData: ChartData,
    mainLabel: string,
    labelYAxis?: string,
    toolTipUnit?: string
  ): void {
    let minValue = 0;
    let minDivisor: any;
    if (!this.chartOptions.plugins.title) {
      this.chartOptions.plugins.title = {};
    }
    if (mainLabel) {
      this.chartOptions.plugins.title.text = mainLabel;
    }
    this.chartOptions.plugins.title.color = this.fontColor;
    if (!this.chartOptions.plugins.title.font) {
      this.chartOptions.plugins.title.font = {};
    }
    this.chartOptions.plugins.title.font['family'] = this.fontFamily;
    this.chartOptions.plugins.title.font['size'] = this.fontSizeNumber;
    if (this.withLegend) {
      if (!this.chartOptions.plugins.legend) {
        this.chartOptions.plugins.legend = {
          labels: {
            color: '',
            font: {
              family: '',
            },
          },
        };
      }
      this.chartOptions.plugins.legend.labels.color = this.fontColor;
      this.chartOptions.plugins.legend.labels.font['family'] = this.fontFamily;
    }
    if (this.chartType === ChartTypeValues.PIE) {
      minDivisor = this.constMinDivisorPie;
    } else {
      minDivisor = this.constMinDivisorBar;
      const x = this.chartOptions.scales.x;
      x['title']['color'] = this.fontColor;
      x['title']['font'] = { family: this.fontFamily };
      x.ticks.color = this.fontColor;
      x.ticks.font = { family: this.fontFamily };
      const y = this.chartOptions.scales.y;
      y['title']['color'] = this.fontColor;
      y['title']['font'] = { family: this.fontFamily };
      y.ticks.color = this.fontColor;
      y.ticks.font = { family: this.fontFamily };
    }
    this.chartOptions.plugins.tooltip.backgroundColor = this.fontColor;
    this.chartOptions.plugins.tooltip.bodyFont = { family: this.fontFamily };
    this.chartOptions.plugins.tooltip.footerFont = { family: this.fontFamily };
    this.chartOptions.plugins.tooltip.titleFont = { family: this.fontFamily };
    this.chartOptions.plugins.tooltip.bodyColor = this.inversedFontColor;
    this.chartOptions.plugins.tooltip.footerColor = this.inversedFontColor;
    this.chartOptions.plugins.tooltip.titleColor = this.inversedFontColor;
    if (this.stackedChart) {
      chartData.datasets.forEach((dataset) => {
        if (
          Array.isArray(dataset.data) === true &&
          dataset.stack === ChartConstants.STACKED_TOTAL
        ) {
          for (const data of dataset.data) {
            if (typeof data === 'number' && data > minValue) {
              minValue = data;
            }
          }
        }
      });
      minValue = minValue / minDivisor;
    } else {
      chartData.datasets.forEach((dataset) => {
        if (Array.isArray(dataset.data) === true) {
          for (const data of dataset.data) {
            if (typeof data === 'number') {
              minValue = minValue + data;
            }
          }
        }
      });
      minValue = minValue / minDivisor;
    }
    this.chartOptions.plugins.datalabels = {
      color: this.fontColor,
      font: this.font,
      display: (context) => context.dataset.data[context.dataIndex] > minValue,
      formatter: (value, context) => {
        if (this.roundedChartLabels) {
          return Math.round(value).toLocaleString(this.language);
        } else {
          return value.toLocaleString(this.language);
        }
      },
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
        const backgroundColor = [];
        for (let i = 0; i < dataset.data.length; i++) {
          backgroundColor.push(this.getColorCode(i));
        }
        dataset.backgroundColor = backgroundColor;
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
      [218, 112, 214, 0.8],
    ];
    const div20 = counter % 20;
    return `rgba(${colors[div20][0]}, ${colors[div20][1]}, ${colors[div20][2]}, ${colors[div20][3]})`;
  }

  private inverseColor(color: string, blackWhite = false): string {
    let hex: string;
    let rgba: string[];
    let rgb: string[];
    let sep: string;
    let stringValue: string;
    let numberValue: number;
    let r: number;
    let g: number;
    let b: number;
    let a: number;
    // determine color format:
    if (color.startsWith('#')) {
      // color in hex format:
      hex = color.slice(1);
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      if (color.indexOf('rgba') === 0) {
        // color in rgba format:
        sep = color.indexOf(',') > -1 ? ',' : ' ';
        rgba = color.substr(5).split(')')[0].split(sep);
        // Strip the slash if using space-separated syntax
        if (rgba.indexOf('/') > -1) {
          rgba.splice(3, 1);
        }
        for (let i = 0; i < rgba.length; i++) {
          stringValue = rgba[i];
          if (stringValue.indexOf('%') > -1) {
            numberValue = parseInt(stringValue.substr(0, stringValue.length - 1), 10);
            numberValue /= 100;
            if (i < 3) {
              rgba[i] = Math.round(numberValue * 255).toString(10);
            } else {
              rgba[i] = numberValue.toString(10);
            }
          }
        }
        r = parseInt(rgba[0], 10);
        g = parseInt(rgba[1], 10);
        b = parseInt(rgba[2], 10);
        a = parseInt(rgba[3], 10);
      } else {
        if (color.indexOf('rgb') === 0) {
          // color in rgb format:
          sep = color.indexOf(',') > -1 ? ',' : ' ';
          rgb = color.substr(4).split(')')[0].split(sep);
          for (let i = 0; i < rgb.length; i++) {
            stringValue = rgb[i];
            if (stringValue.indexOf('%') > -1) {
              rgb[i] = Math.round(
                (parseInt(stringValue.substr(0, stringValue.length - 1), 10) / 100) * 255
              ).toString(10);
            }
          }
          r = parseInt(rgb[0], 10);
          g = parseInt(rgb[1], 10);
          b = parseInt(rgb[2], 10);
        } else {
          return '#fff';
        }
      }
    }
    if (blackWhite) {
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000' : '#fff';
    }
    // Invert color components
    stringValue = '#';
    numberValue = 255 - r;
    if (numberValue < 16) {
      stringValue += '0';
    }
    stringValue += numberValue.toString(16);
    numberValue = 255 - g;
    if (numberValue < 16) {
      stringValue += '0';
    }
    stringValue += numberValue.toString(16);
    numberValue = 255 - b;
    if (numberValue < 16) {
      stringValue += '0';
    }
    stringValue += numberValue.toString(16);
    return stringValue;
  }
}
