import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppCurrencyPipe } from 'shared/formatters/app-currency.pipe';
import { AppDecimalPipe } from 'shared/formatters/app-decimal.pipe';

import { ChartComponent } from './chart.component';
import { ChartScaleService } from './chartScales.service';

@NgModule({
  imports: [CommonModule],
  declarations: [ChartComponent],
  exports: [ChartComponent],
  providers: [
    ChartScaleService
  ]
})
export class ChartModule {
}
