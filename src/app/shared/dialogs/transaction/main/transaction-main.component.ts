import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Transaction } from '../../../../types/Transaction';

@Component({
  selector: 'app-transaction-main',
  templateUrl: './transaction-main.component.html',
})
export class TransactionMainComponent implements OnInit {
  @Input() public transaction: Transaction;
  @Input() public loggedUserImage: string;
  @Input() public totalConsumptionWh: number;
  @Input() public totalDurationSecs: number;
  @Input() public stateOfChargeIcon: string;
  @Input() public isCarComponentActive: boolean;
  @Input() public canDisplayCar: boolean;
  @Input() public isStoppedByAnotherUser: boolean;

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
    // Load
    // this.loadData();
  }
}
