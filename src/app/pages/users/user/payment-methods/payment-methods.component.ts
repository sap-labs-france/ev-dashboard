import { Component, Input, OnInit } from '@angular/core';

import { PaymentMethodsTableDataSource } from './payment-methods-table-data-source';

@Component({
  selector: 'app-payment-methods',
  template: '<app-table [dataSource]="paymentMethodsTableDataSource"></app-table>',
  providers: [PaymentMethodsTableDataSource],
})
export class PaymentMethodsComponent implements OnInit {
  @Input() public currentUserID!: string;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public paymentMethodsTableDataSource: PaymentMethodsTableDataSource,
  ) {
  }

  public ngOnInit() {
    this.paymentMethodsTableDataSource.setCurrentUserID(this.currentUserID);
  }
}
