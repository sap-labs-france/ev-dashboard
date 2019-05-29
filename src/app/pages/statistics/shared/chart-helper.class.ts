import {ElementRef} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Chart, ChartData, ChartOptions} from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';

export class ChartHelperClass {
    private chart: Chart;
    private chartType: string;
    private stackedChart = false;
    private chartOptions: ChartOptions;
    private chartData: ChartData;
    private constLabelSize = 20;
    private totalLabel: string;
    private itemsHidden = false;

    constructor(private translateService: TranslateService,
                chartType: 'bar' | 'stackedBar' | 'pie', mainLabel: string,
                labelXAxis?: string, labelYAxis?: string, withLegend = false) {

        this.totalLabel = this.translateService.instant('statistics.total');
        if (this.totalLabel === '') {
            this.totalLabel = 'Total';
        }

        switch (chartType) {
            case 'pie':
                this.createPieChartOptions(mainLabel, withLegend);
                break;
            case 'bar':
                this.createBarChartOptions(false, mainLabel, labelXAxis, labelYAxis, withLegend);
                break;
            case 'stackedBar':
                this.createBarChartOptions(true, mainLabel, labelXAxis, labelYAxis, withLegend);
        }
    }

    public initChart(context: ElementRef): void {
        this.chart = new Chart(context.nativeElement.getContext('2d'), {
            type: this.chartType,
            plugins: [ChartDataLabels],
            options: this.chartOptions,
            data: { labels: [], datasets: [] }
        } )
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
                if (dataset.label !== this.totalLabel) {
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

    private createBarChartOptions(stacked: boolean, mainLabel: string, labelXAxis: string, labelYAxis: string, withLegend: boolean): void {
        this.chartType = 'bar';
        this.stackedChart = stacked;

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
                    return data.datasets[tooltipItem.datasetIndex].label + ' : ' +
                    data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
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
                            return value.toLocaleString();
                        }
                    }
                }]
        }
    }

    private createPieChartOptions(mainLabel: string, withLegend: boolean): void {
        this.chartType = 'pie';

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
                    return data.labels[tooltipItem.index] + ' : ' +
                    data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].toLocaleString();
                }
            }
        };
    }

    private updateChartOptions(chartData: ChartData, mainLabel: string): void {
        let minValue = 0;
        let number: any;

        if (mainLabel) {
            this.chartOptions.title.text = mainLabel;
        }

        if (this.stackedChart) {
            if (Array.isArray(chartData.datasets)) {
                chartData.datasets.forEach((dataset) => {
                  if (Array.isArray(dataset.data) === true &&
                    dataset.label === this.totalLabel) {
                    for (let i = 0; i < dataset.data.length; i++) {
                      number = dataset.data[i];
                      if (typeof (number) === 'number') {
                        if (number > minValue) { minValue = number }
                      }
                    };
                  }
                });
                minValue = minValue / 40;
              }
        } else {
            if (Array.isArray(chartData.datasets)) {
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
                minValue = minValue / 40;
              }
        }

        this.chartOptions['plugins']['datalabels'] = {
            color: 'black',
            display: (context) => {
                return context.dataset.data[context.dataIndex] > minValue
            },
        //  font: { weight: 'bold' },
            formatter: (value, context) => {
                return value.toLocaleString();
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
                if (dataset.label === this.totalLabel) {
                    dataset.stack = this.totalLabel;
                    dataset.hidden = false;
                    dataset.backgroundColor = 'darkgrey';
                    dataset.borderWidth = 0;
                } else {
                    dataset.stack = 'item';
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
        const colors = [[144, 238, 144, 0.8],
            [255, 165, 0, 0.6],
            [135, 206, 235, 0.8],
            [222, 184, 135, 0.6],
            [255, 182, 193, 0.8],
            [102, 205, 170, 0.6],
            [255, 160, 122, 0.8],
            [70, 130, 180, 0.6],
            [255, 222, 173, 0.8],
            [218, 112, 214, 0.6]
            ];

        const div10 = counter % 10;
        return `rgba(${colors[div10][0]}, ${colors[div10][1]}, ${colors[div10][2]}, ${colors[div10][3]})`
    }
}
