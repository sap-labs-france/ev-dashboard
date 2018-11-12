import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'kiloWatt'})
export class PricePipe implements PipeTransform {
  transform(price: number, currency): any {
    return Number.parseFloat(`${price}`).toFixed(2) + ' ' + currency;
  }
}
