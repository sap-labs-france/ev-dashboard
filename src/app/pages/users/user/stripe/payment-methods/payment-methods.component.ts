import { Component } from '@angular/core';

import { PaymentMethodsTableDataSource } from './payment-methods-table-data-source';

@Component({
  selector: 'app-payment-methods',
  templateUrl: 'payment-methods.component.html',
})
export class PaymentMethodsComponent {
  constructor(
    public paymentMethodsTableDataSource: PaymentMethodsTableDataSource,
  ) {
  }
}
