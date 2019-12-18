import { Pipe, PipeTransform } from '@angular/core';
import { PartialBillingTax } from '../../common.types';

@Pipe({name: 'appTaxName'})
export class AppTaxName implements PipeTransform {

  transform(tax: PartialBillingTax): string {
    if (!tax) {
      return '';
    }

    let formatted = '';
    formatted += tax.displayName ? tax.displayName + ' - ' : '';
    formatted += tax.description ? tax.description + ' - ' : '';
    formatted += tax.percentage ? '(' + tax.percentage + '%)' : '';
    return formatted;
  }
}
