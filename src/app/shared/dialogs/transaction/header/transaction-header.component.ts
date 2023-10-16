import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuthorizationService } from 'services/authorization.service';
import { ComponentService } from 'services/component.service';
import { TenantComponents } from 'types/Tenant';
import { Utils } from 'utils/Utils';

import { Transaction } from '../../../../types/Transaction';

@Component({
  selector: 'app-transaction-header',
  templateUrl: 'transaction-header.component.html',
  styleUrls: ['transaction-header.component.scss'],
})
export class TransactionHeaderComponent implements OnChanges {
  @Input() public transaction: Transaction;
  @Input() public loggedUserImage: string;
  @Input() public carImage: string;

  public isCarComponentActive = false;
  public canDisplayCar = false;
  public canUpdateCar = false;
  public stateOfChargeIcon!: string;
  public stateOfCharge!: number;
  public endStateOfCharge!: number;
  public isStoppedByAnotherUser = false;
  public totalConsumptionWh!: number;
  public totalDurationSecs!: number;

  public constructor(
    private authorizationService: AuthorizationService,
    private componentService: ComponentService
  ) {
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    if (this.isCarComponentActive) {
      this.canUpdateCar = this.authorizationService.canUpdateCar();
      this.canDisplayCar = this.authorizationService.canReadCar();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.loadData(this.transaction);
  }

  private loadData(transaction: Transaction): void {
    if (transaction) {
      // Set properties
      if (transaction.stop) {
        this.totalConsumptionWh = transaction.stop.totalConsumptionWh;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.stop.stateOfCharge;
        this.totalDurationSecs = transaction.stop.totalDurationSecs;
        this.isStoppedByAnotherUser =
          transaction.user && transaction.user.id !== transaction.stop.user.id;
      } else {
        this.totalConsumptionWh = transaction.currentTotalConsumptionWh;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.currentStateOfCharge;
        this.totalDurationSecs = transaction.currentTotalDurationSecs;
      }
      if (Utils.objectHasProperty(transaction, 'stateOfCharge')) {
        if (this.stateOfCharge === 100) {
          this.stateOfChargeIcon = 'battery_full';
        } else if (this.stateOfCharge >= 90) {
          this.stateOfChargeIcon = 'battery_charging_90';
        } else if (this.stateOfCharge >= 80) {
          this.stateOfChargeIcon = 'battery_charging_80';
        } else if (this.stateOfCharge >= 60) {
          this.stateOfChargeIcon = 'battery_charging_60';
        } else if (this.stateOfCharge >= 50) {
          this.stateOfChargeIcon = 'battery_charging_50';
        } else if (this.stateOfCharge >= 30) {
          this.stateOfChargeIcon = 'battery_charging_30';
        } else {
          this.stateOfChargeIcon = 'battery_charging_20';
        }
      }
    }
  }
}
