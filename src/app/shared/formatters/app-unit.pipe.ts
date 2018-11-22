import {Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {LocaleService} from '../../services/locale.service';

@Pipe({name: 'appUnit'})
export class AppUnitPipe implements PipeTransform {
  private locale: string;

  constructor(locale: LocaleService) {
    this.locale = locale.getCurrentFullLocaleForJS();
  }

  _parseMeasure(measureAsString): Measure {
    if (Unit[Unit[measureAsString]] === measureAsString) {
      return {unit: Unit[measureAsString], size: Size.basis}
    }
    return {unit: Unit[measureAsString.slice(1)], size: Size[measureAsString.slice(0, 1)] as any}
  }

  transform(value: number, srcMeasure: string = '', destMeasure: string = '', withUnit: boolean = true): any {
    const src = this._parseMeasure(srcMeasure);
    const dest = this._parseMeasure(destMeasure);
    return `${new DecimalPipe(this.locale).transform(value / (src.size * dest.size), '2.2-2')} ${withUnit ? destMeasure : ''}`;
  }
}

interface Measure {
  unit: string;
  size: number;
}

enum Unit {
  W,
  Wh
}

enum Size {
  basis = 1,
  c = 10 * Size.basis,
  d = 10 * Size.c,
  k = 10 * Size.d,
  m = 10 * Size.k
}
