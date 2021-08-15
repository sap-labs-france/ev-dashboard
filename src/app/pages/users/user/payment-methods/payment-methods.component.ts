import { Component } from '@angular/core';

import { PaymentMethodsTableDataSource } from './payment-methods-table-data-source';

@Component({
  selector: 'app-payment-methods',
  templateUrl: 'payment-methods.component.html',
})
export class PaymentMethodsComponent {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public paymentMethodsTableDataSource: PaymentMethodsTableDataSource,
  ) {}
}
