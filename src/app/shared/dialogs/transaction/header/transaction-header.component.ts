import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthorizationService } from 'services/authorization.service';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';

import { Transaction } from '../../../../types/Transaction';

@Component({
  selector: 'app-transaction-header',
  templateUrl: './transaction-header.component.html',
})
export class TransactionHeaderComponent implements OnInit {
  @Input() public transaction: Transaction;
  @Input() public loggedUserImage: string;
  @Input() public carImage: string;
  @Input() public totalConsumptionWh: number;
  @Input() public totalDurationSecs: number;
  @Input() public stateOfChargeIcon: string;
  @Input() public stateOfCharge: number;
  @Input() public endStateOfCharge: number;
  @Input() public isStoppedByAnotherUser: boolean;

  public isCarComponentActive: boolean;
  public canDisplayCar: boolean;
  public canUpdateCar: boolean;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
  ) {
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    this.canUpdateCar = this.authorizationService.canUpdateCar();
    this.canDisplayCar = this.authorizationService.canReadCar();
  }

  public ngOnInit() {
    // Load
    // this.loadData();
  }
}
