import {Pipe, PipeTransform} from '@angular/core';
import {DecimalPipe} from '@angular/common';

@Pipe({name: 'appKiloUnit'})
export class AppKiloUnitPipe implements PipeTransform {

  constructor(private _locale: string = 'en-US') {
  }

  transform(value: number, unit: string): any {
    return `${new DecimalPipe(this._locale).transform(value / 1000, '2.2-2')} ${unit}`;
  }
}
