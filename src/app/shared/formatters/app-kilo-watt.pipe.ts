import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'kiloWatt'})
export class AppKiloWattPipe implements PipeTransform {
  transform(value: number): any {
    return Number.parseFloat(`${value / 1000}`).toFixed(2) + ' kW';
  }
}
