import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule],
  declarations: [NumberCardComponent],
  exports: [NumberCardComponent],
  providers: [
    ChartScaleService
  ]
})
export class ChartModule {
}
