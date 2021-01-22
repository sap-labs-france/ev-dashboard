import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { ConfigService } from '../../../services/config.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartComponent } from '../../../shared/component/consumption-chart/consumption-chart.component';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
import { Image } from '../../../types/GlobalType';
import TenantComponents from '../../../types/TenantComponents';
import { Transaction } from '../../../types/Transaction';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
})
export class TransactionComponent implements OnInit, OnDestroy {
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
  public stopUserImage = Constants.USER_NO_PICTURE;
  public carImage = Constants.NO_CAR_IMAGE;
  public isStoppedByAnotherUser = false;
  public totalConsumptionWh!: number;
  public totalInactivitySecs!: number;
  public totalDurationSecs!: number;
  public percentOfInactivity!: string;
  public locale!: string;
  public isCarComponentActive: boolean;
  public canDisplayCar: boolean;
  public canUpdateCar: boolean;

  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;

  private transactionRefreshSubscription!: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private appPercentPipe: AppPercentPipe,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private centralServerNotificationService: CentralServerNotificationService,
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

  private createTransactionRefresh() {
    if (this.configService.getCentralSystemServer().socketIOEnabled) {
      this.transactionRefreshSubscription = this.centralServerNotificationService.getSubjectTransaction().pipe(debounceTime(
        this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
          // Update user?
          if (singleChangeNotification && singleChangeNotification.data
            && singleChangeNotification.data.id === this.transactionID.toString()) {
            this.refreshTransaction();
          }
        });
    }
  }

  private destroyTransactionRefresh() {
    if (this.transactionRefreshSubscription) {
      this.transactionRefreshSubscription.unsubscribe();
    }
    this.transactionRefreshSubscription = null;
  }

  private refreshTransaction() {
    this.loadData();
    this.chartComponent.refresh();
  }

  public loadData() {
    this.spinnerService.show();
    if (!this.transactionID) {
      this.centralServerService.getLastTransaction(this.chargingStationID, this.connectorID)
        .subscribe((dataResult) => {
          if (dataResult.result && dataResult.result.length > 0) {
            this.transactionID = Utils.convertToInteger(dataResult.result[0].id);
            this.loadConsumption(this.transactionID);
          } else {
            this.spinnerService.hide();
            this.messageService.showInfoMessage('chargers.no_transaction_found', { chargerID: this.chargingStationID });
            this.dialogRef.close();
          }
        });
    } else {
      this.loadConsumption(this.transactionID);
    }
  }

  public loadConsumption(transactionID: number) {
    this.spinnerService.show();
    this.centralServerService.getTransactionConsumption(this.transactionID).subscribe((transaction: Transaction) => {
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
        this.totalInactivitySecs = transaction.stop.totalInactivitySecs;
        this.isStoppedByAnotherUser = (transaction.user && transaction.user.id !== transaction.stop.user.id);
      } else {
        this.totalConsumptionWh = transaction.currentTotalConsumptionWh;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.currentStateOfCharge;
        this.totalDurationSecs = transaction.currentTotalDurationSecs;
        this.totalInactivitySecs = transaction.currentTotalInactivitySecs;
      }
      this.percentOfInactivity =
        ` (${this.appPercentPipe.transform(this.totalDurationSecs > 0 ? this.totalInactivitySecs / this.totalDurationSecs : 0, '1.0-0')})`;
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
      if (transaction.user) {
        this.centralServerService.getUserImage(transaction.user.id).subscribe((userImage: Image) => {
          if (userImage && userImage.image) {
            this.loggedUserImage = userImage.image.toString();
          }
        });
      }
      if (transaction?.carCatalog?.image) {
        this.carImage = transaction.carCatalog.image;
      }
      if (transaction.stop && transaction.stop.user) {
        this.centralServerService.getUserImage(transaction.stop.user.id).subscribe((userImage: Image) => {
          if (userImage && userImage.image) {
            this.stopUserImage = userImage.image.toString();
          }
        });
      }
    }, (error) => {
      this.spinnerService.hide();
      this.dialogRef.close();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'transactions.load_transaction_error');
    });
  }
}
