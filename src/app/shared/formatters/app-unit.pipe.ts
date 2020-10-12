import { Pipe, PipeTransform } from '@angular/core';

import { AppDecimalPipe } from './app-decimal-pipe';

@Pipe({ name: 'appUnit' })
export class AppUnitPipe implements PipeTransform {

  constructor(
    private decimalPipe: AppDecimalPipe) {
  }

  public transform(value: number, srcMeasure: string = '', destMeasure: string = '', withUnit: boolean = true, numberOfInteger: number = 1,
    numberOfDecimalMin: number = 2, numberOfDecimalMax: number = 2): string {
    if (value === 0) {
      numberOfDecimalMin = 0;
    }
    if (srcMeasure === destMeasure) {
      return this.decimalPipe.transform(value,
        `${numberOfInteger}.${numberOfDecimalMin}-${numberOfDecimalMax}`) + `${withUnit ? ' ' + destMeasure : ''}`;
    }
    const src = this.parseMeasure(srcMeasure);
    const dest = this.parseMeasure(destMeasure);
    const localDestMeasure = destMeasure.replace('Wh', 'W.h');
    return this.decimalPipe.transform(value / (src.size * dest.size),
      `${numberOfInteger}.${numberOfDecimalMin}-${numberOfDecimalMax}`) + `${withUnit ? ' ' + localDestMeasure : ''}`;
  }

  private parseMeasure(measureAsString: string): Measure {
    if (Unit[Unit[measureAsString]] === measureAsString) {
      return { unit: Unit[measureAsString], size: Size.basis };
    }
    return { unit: Unit[measureAsString.slice(1)], size: Size[measureAsString.slice(0, 1)] as any };
  }
}

interface Measure {
  unit: string;
  size: number;
}

enum Unit {
  W,
  Wh,
}

enum Size {
  basis = 1,
  c = 10 * Size.basis,
  d = 10 * Size.c,
  k = 10 * Size.d,
  m = 10 * Size.k,
}
