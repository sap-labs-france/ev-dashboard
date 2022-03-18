import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AppCurrencyPipe } from 'shared/formatters/app-currency.pipe';
import { AppDecimalPipe } from 'shared/formatters/app-decimal.pipe';
import { ChartAxisNames } from 'types/Chart';

@Injectable({
  providedIn: 'root'
})
export class ChartScaleService {

  private gridDisplay = {
    [ChartAxisNames.POWER]: true,
    [ChartAxisNames.AMPERAGE]: true,
    [ChartAxisNames.PERCENTAGE]: false,
    [ChartAxisNames.VOLTAGE]: false,
    [ChartAxisNames.AMOUNT]: false,
  };
  private defaultColor: string;
  private defaultGridColor: string;
  private priceUnit: string;

  public constructor(
    private decimalPipe: AppDecimalPipe,
    private appCurrencyPipe: AppCurrencyPipe,
  ) {
    this.defaultColor = 'rgba(0,0,0,0.2)';
    this.defaultGridColor = this.defaultColor;
  }

  public setDefaultColor(color: string) {
    this.defaultColor = color;
  }

  public setDefaultGridColor(color: string) {
    this.defaultGridColor = color;
  }

  public setPriceUnit(unit: string) {
    this.priceUnit = unit;
  }

  public buildScales() {
    return {
      [ChartAxisNames.X]: {
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
          color: this.defaultGridColor,
        },
        ticks: {
          autoSkip: true,
          color: this.defaultColor,
        },
      },
      [ChartAxisNames.POWER]:{
        type: 'linear',
        position: 'left',
        display: 'auto',
        ticks: {
          callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + ((value < 1000) ? 'W' : 'kW'),
          color: this.defaultColor,
        },
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ChartAxisNames.POWER],
          color: this.defaultGridColor,
        },
      },
      [ChartAxisNames.AMPERAGE]: {
        type: 'linear',
        position: 'left',
        display: 'auto',
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ChartAxisNames.AMPERAGE],
          color: this.defaultGridColor,
        },
        ticks: {
          callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'A',
          color: this.defaultColor,
        },
      },
      [ChartAxisNames.VOLTAGE]: {
        type: 'linear',
        position: 'left',
        display: 'auto',
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ChartAxisNames.VOLTAGE],
          color: this.defaultGridColor,
        },
        ticks: {
          callback: (value: number) => parseInt(this.decimalPipe.transform(value, '1.0-0'), 10) + 'V',
          color: this.defaultColor,
        },
      },
      [ChartAxisNames.PERCENTAGE]: {
        type: 'linear',
        position: 'right',
        display: 'auto',
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ChartAxisNames.PERCENTAGE],
          color: this.defaultGridColor,
        },
        ticks: {
          callback: (value) => `${value}%`,
          color: this.defaultColor,
        },
      },
      [ChartAxisNames.AMOUNT]: {
        type: 'linear',
        position: 'right',
        display: 'auto',
        beginAtZero: true,
        min: 0,
        grid: {
          display: true,
          drawOnChartArea: this.gridDisplay[ChartAxisNames.AMOUNT],
          color: this.defaultGridColor,
        },
        ticks: {
          callback: (value: number) => {
            const result = this.appCurrencyPipe.transform(value, this.priceUnit);
            return result ? result : '';
          },
          color: this.defaultColor,
        },
      }
    };
  }

}
