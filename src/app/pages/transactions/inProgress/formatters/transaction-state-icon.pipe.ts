import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'transactionStateIcon'})
export class TransactionStateIconPipe implements PipeTransform {
  transform(isLoading: boolean, options = {iconClass: ''}): any {
    const classNames = (options.iconClass ? options.iconClass : '');
    if (isLoading) {
      return `<i class="material-icons card-icon ${classNames} icon-warning">battery_charging_full</i>`
    } else {
      return `<i class="material-icons card-icon ${classNames} icon-success">battery_full</i>`
    }
  }
}
