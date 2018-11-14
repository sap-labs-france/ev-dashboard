import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'appPrice'})
export class AppPricePipe implements PipeTransform {
  transform(price: number, currency): any {
    return Number.parseFloat(`${price}`).toFixed(2) + ' ' + currency;
  }
}
