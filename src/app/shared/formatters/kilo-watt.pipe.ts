import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'kiloWatt'})
export class KiloWattPipe implements PipeTransform {
  transform(value: number): any {
    return Number.parseFloat(`${value / 1000}`).toFixed(2) + ' kW';
  }
}
