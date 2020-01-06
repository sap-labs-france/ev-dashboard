import { Pipe, PipeTransform } from '@angular/core';
import { BillingTax } from 'app/types/Billing';

@Pipe({name: 'appTaxName'})
export class AppTaxName implements PipeTransform {

  transform(tax: BillingTax): string {
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
