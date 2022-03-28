import { Component, Input, OnChanges } from '@angular/core';
import { User } from 'types/User';

import { PaymentMethodsTableDataSource } from './payment-methods-table-data-source';

@Component({
  selector: 'app-payment-methods',
  template: '<app-table [dataSource]="paymentMethodsTableDataSource"></app-table>',
  providers: [PaymentMethodsTableDataSource],
})
export class PaymentMethodsComponent implements OnChanges {
  @Input() public user!: User;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public paymentMethodsTableDataSource: PaymentMethodsTableDataSource,
  ) {
  }

  public ngOnChanges() {
    this.paymentMethodsTableDataSource.setCurrentUserID(this.user?.id);
  }
}
