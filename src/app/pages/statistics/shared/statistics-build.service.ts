import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ChartData} from 'chart.js'; // could also use any other data definition
import * as moment from 'moment';

@Injectable()
export class StatisticsBuildService {
    private totalLabel: string;
    private monthLabel: string;

    constructor(
        private translateService: TranslateService) {
            this.totalLabel = this.translateService.instant('statistics.total');
            if (this.totalLabel === '') {
                this.totalLabel = 'Total';
            }
            this.monthLabel = 'month';
        }

    public buildStackedChartDataForMonths(statisticsData: any, roundingDecimals: number = 0): ChartData {
        const stackedChartData: ChartData = { labels: [], datasets: []};

        let roundingFactor = 1;
        let monthString = '';
        let dataSetIndex = 0;
        let monthIndex = 0;
        let countMonths = 0;

        const totalDataArray = [];
        const transactionValues = statisticsData;

        if (roundingDecimals > 0) {
            for (let i = 0; i < roundingDecimals; i++) {
                roundingFactor *= 10;
            }
        }

        if (transactionValues && transactionValues.length > 0) {
            transactionValues.forEach((transactionValue: { [x: string]: number; }) => {

                // for each month (sorted from 0 to 11):
                let totalValuePerMonth = 0;
                let numberArray = [];
                countMonths++;

                monthIndex = transactionValue[this.monthLabel];

                monthString = moment().month(monthIndex).format('MMMM');

                if (stackedChartData.labels.indexOf(monthString) < 0) {
                    stackedChartData.labels.push(monthString);
                }

                // now for all items:
                for (const key in transactionValue) {
                    if (key !== this.monthLabel) {

                        // Round
                        transactionValue[key] *= roundingFactor;
                        transactionValue[key] = Math.round(transactionValue[key]);
                        transactionValue[key] /= roundingFactor;

                        dataSetIndex = stackedChartData.datasets.findIndex((dataset) => dataset['label'] === key);

                        if (dataSetIndex < 0) {
                            numberArray = [];

                            for (let i = 1; i < countMonths; i++) {
                                // add leading zeros for previous months without activity
                                numberArray.push(0);
                            }

                            numberArray.push(transactionValue[key]);
                            stackedChartData.datasets.push({ 'label': key, 'data': numberArray });
                        } else {
                            numberArray = stackedChartData.datasets[dataSetIndex].data;
                            numberArray.push(transactionValue[key]);
                            stackedChartData.datasets[dataSetIndex].data = numberArray;
                        }

                        totalValuePerMonth += transactionValue[key];
                    }
                }

                // add trailing zero if no activity in the current month:
                stackedChartData.datasets.forEach((dataset) => {
                    if (dataset.label !== this.totalLabel) {
                        numberArray = dataset.data;
                        if (numberArray.length < countMonths) {
                            for (let i = numberArray.length; i < countMonths; i++) {
                                numberArray.push(0);
                            }
                            dataset.data = numberArray;
                        }
                    }
                });

                // Deferred update for totals:
                totalDataArray.push(totalValuePerMonth);
            });

            // sort chart datasets by label name:
            stackedChartData.datasets.sort((dataset1, dataset2) => {
                if (dataset1['label'] < dataset2['label']) {
                    return -1
                } else {
                    if (dataset1['label'] > dataset2['label']) {
                        return 1
                    } else {
                        return 0
                    }
                }
            });

            // Last chart dataset for totals:
            stackedChartData.datasets.push({ 'label': this.totalLabel, 'data': totalDataArray });
        }

        return stackedChartData
    }

    public calculateTotalValueFromChartData(chartData: ChartData): number {
        let totalValue = 0;
        let dataSetIndex = 0;
        let numberArray = [];

        // is the chart a stacked chart (with totals)?
        dataSetIndex = chartData.datasets.findIndex((dataset) => dataset.label === this.totalLabel);
        if (dataSetIndex < 0) {
        // no, it is a simple chart
            if (chartData.datasets.length > 0) {
                numberArray = chartData.datasets[0].data;
                numberArray.forEach((number) => {totalValue += number});
            }
        } else {
        // yes, it is a stacked chart with totals
            numberArray = chartData.datasets[dataSetIndex].data;
            numberArray.forEach((number) => {totalValue += number});
        }

        return totalValue;
    }

    public calculateTotalChartDataFromStackedChartData(stackedChartData: ChartData): ChartData {
        const totalChartData: ChartData = { labels: [], datasets: []};
        let totalValue = 0;
        let numberArray = [];

        stackedChartData.datasets.forEach((dataset) => {
            if (dataset.label !== this.totalLabel) {
                totalChartData.labels.push(dataset.label);

                totalValue = 0;
                numberArray = dataset.data;
                numberArray.forEach((number) => {totalValue += number});

                if (totalChartData.datasets.length === 0) {
                    numberArray = [];
                    numberArray.push(totalValue);
                    totalChartData.datasets.push({ 'data': numberArray });
                  } else {
                    numberArray = totalChartData.datasets[0].data;
                    numberArray.push(totalValue);
                    totalChartData.datasets[0].data = numberArray;
                  }
            }
        })

        return totalChartData;
    }

}
