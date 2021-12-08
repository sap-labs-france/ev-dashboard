import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { ConfigService } from '../../../services/config.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartComponent } from '../../../shared/component/consumption-chart/consumption-chart.component';
import { Image } from '../../../types/GlobalType';
import { TenantComponents } from '../../../types/Tenant';
import { Transaction } from '../../../types/Transaction';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit, OnDestroy {
  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;

  @Input() public transactionID!: number;
  @Input() public connectorID!: number;
  @Input() public chargingStationID!: string;
  @Input() public inDialog!: boolean;
  @Input() public dialogRef!: MatDialogRef<any>;

  public transaction!: Transaction;
  public stateOfChargeIcon!: string;
  public stateOfCharge!: number;
  public endStateOfCharge!: number;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public carImage = Constants.NO_CAR_IMAGE;
  public isStoppedByAnotherUser = false;
  public totalConsumptionWh!: number;
  public totalDurationSecs!: number;
  public locale!: string;
  public isCarComponentActive: boolean;
  public canDisplayCar: boolean;
  public canUpdateCar: boolean;

  private refreshInterval;

  public constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private configService: ConfigService,
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    this.canUpdateCar = this.authorizationService.canUpdateCar();
    this.canDisplayCar = this.authorizationService.canReadCar();
  }

  public ngOnInit(): void {
    // Load
    this.loadData();
  }

  public ngOnDestroy(): void {
    // Destroy transaction refresh
    this.destroyTransactionRefresh();
  }

  public loadData() {
    if (!this.transactionID) {
      this.spinnerService.show();
      this.centralServerService.getLastTransaction(this.chargingStationID, this.connectorID).subscribe((dataResult) => {
        this.spinnerService.hide();
        if (!Utils.isEmptyArray(dataResult.result)) {
          this.transactionID = Utils.convertToInteger(dataResult.result[0].id);
          this.loadConsumption();
        } else {
          this.spinnerService.hide();
          this.messageService.showInfoMessage('chargers.no_transaction_found', { chargerID: this.chargingStationID });
          this.dialogRef.close();
        }
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.load_transaction_error');
      });
    } else {
      this.loadConsumption();
    }
  }

  public loadConsumption() {
    this.spinnerService.show();
    this.centralServerService.getTransaction(this.transactionID).subscribe((transaction: Transaction) => {
      this.spinnerService.hide();
      this.transaction = transaction;
      // Transaction in progress?
      if (!transaction.stop) {
        // Transaction refresh
        this.createTransactionRefresh();
      }
      // Set properties
      if (transaction.stop) {
        this.totalConsumptionWh = transaction.stop.totalConsumptionWh;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.stop.stateOfCharge;
        this.totalDurationSecs = transaction.stop.totalDurationSecs;
        this.isStoppedByAnotherUser = (transaction.user && transaction.user.id !== transaction.stop.user.id);
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
      // Load User's image
      if ((this.loggedUserImage === Constants.USER_NO_PICTURE) && transaction.user) {
        this.centralServerService.getUserImage(transaction.user.id).subscribe((userImage: Image) => {
          if (userImage && userImage.image) {
            this.loggedUserImage = userImage.image.toString();
          }
        });
      }
      // Load Car's image
      if ((this.carImage === Constants.NO_CAR_IMAGE) && transaction?.carCatalogID) {
        this.centralServerService.getCarCatalogImages(transaction.carCatalogID, {},
          { limit: 1, skip: Constants.DEFAULT_SKIP }).subscribe((carImage) => {
          if (carImage.count > 0) {
            this.carImage = carImage.result[0].image;
          }
        });
      }
    }, (error) => {
      this.spinnerService.hide();
      this.dialogRef.close();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.load_transaction_error');
    });
  }

  private createTransactionRefresh() {
    const pollIntervalSecs = this.configService.getCentralSystemServer().pollIntervalSecs;
    if (!this.refreshInterval && pollIntervalSecs > 0) {
      // create the timer
      this.refreshInterval = setInterval(() => {
        this.refreshTransaction();
      }, pollIntervalSecs * 1000);
    }
  }

  private destroyTransactionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private refreshTransaction() {
    this.loadData();
    this.chartComponent.refresh();
  }
}
