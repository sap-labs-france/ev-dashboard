import { Pipe, PipeTransform } from '@angular/core';
import { BillingInvoice } from 'app/types/Billing';

@Pipe({name: 'appTaxName'})
export class AppInvoicePricePipe implements PipeTransform {

  transform(invoice: BillingInvoice): string {
    if (!invoice) {
      return '';
    }
    return invoice.amountDue / 100 + ' ' + invoice.currency;
  }
}
