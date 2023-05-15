import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { User } from 'types/User';

import { PaymentMethodsTableDataSource } from './payment-methods-table-data-source';

@Component({
  selector: 'app-payment-methods',
  templateUrl: 'payment-methods.component.html',
  providers: [PaymentMethodsTableDataSource],
})
export class PaymentMethodsComponent implements OnChanges {
  @Input() public currentUserID!: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(public paymentMethodsTableDataSource: PaymentMethodsTableDataSource) {}

  public ngOnChanges(): void {
    this.paymentMethodsTableDataSource.setCurrentUserID(this.currentUserID);
  }
}
