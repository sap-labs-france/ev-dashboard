/* eslint-disable no-useless-constructor */
import { Component, Input } from '@angular/core';
import { ChartDatum } from 'types/Chart';

import { ChartScaleService } from './chartScales.service';

@Component({
  selector: 'app-chart-element',
  templateUrl: './chart.component.html',
})
export class ChartComponent {

  @Input() public data: ChartDatum[];

  public constructor(private chartScalesService: ChartScaleService){
  }

}
