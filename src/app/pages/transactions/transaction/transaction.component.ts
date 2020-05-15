import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfigService } from 'app/services/config.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Image } from 'app/types/GlobalType';
import { Transaction } from 'app/types/Transaction';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { ConsumptionChartComponent } from '../../../shared/component/consumption-chart/consumption-chart.component';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
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
  public isStoppedByAnotherUser = false;
  public totalConsumption!: number;
  public totalInactivitySecs!: number;
  public totalDurationSecs!: number;
  public percentOfInactivity!: string;
  public locale!: string;

  @ViewChild('chartConsumption') public chartComponent!: ConsumptionChartComponent;

  private autoRefeshTimer!: number;
  private autoRefeshPollEnabled!: boolean;
  private autoRefeshPollingIntervalMillis = Constants.DEFAULT_POLLING_MILLIS;
  private refreshSubscription!: Subscription;

  constructor(
    private spinnerService: SpinnerService,
    private messageService: MessageService,
    private router: Router,
    private appPercentPipe: AppPercentPipe,
    private centralServerService: CentralServerService,
    private centralServerNotificationService: CentralServerNotificationService,
    private configService: ConfigService,
    private localeService: LocaleService) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
  }

  public ngOnInit(): void {
    // Handle Poll (config service available only in component not possible in data-source)
    this.autoRefeshPollEnabled = this.configService.getCentralSystemServer().pollEnabled;
    this.autoRefeshPollingIntervalMillis = this.configService.getCentralSystemServer().pollIntervalSecs * 1000;
    // Load
    this.loadData();
  }

  public ngOnDestroy(): void {
    // Destroy
    this.destroyAutoRefreshTimer();
  }

  public createAutoRefreshTimer() {
    // Create timer only if socketIO is not active
    if (this.autoRefeshPollEnabled && !this.autoRefeshTimer) {
      if (this.autoRefeshPollEnabled) {
        // Create timer
        this.autoRefeshTimer = window.setInterval(() => {
          // Reload
          this.refresh();
        }, this.autoRefeshPollingIntervalMillis);
      } else {
        this.refreshSubscription = this.centralServerNotificationService.getSubjectTransaction().pipe(debounceTime(
          this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
          // Update user?
          if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.transactionID.toString()) {
            this.refresh();
          }
        });
      }
    }
  }

  public destroyAutoRefreshTimer() {
    // Clean up
    if (this.autoRefeshTimer) {
      clearInterval(this.autoRefeshTimer);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  public refresh() {
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
        // Auto refresh
        this.createAutoRefreshTimer();
      }
      // Set properties
      if (transaction.stop) {
        this.totalConsumption = transaction.stop.totalConsumption;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.stop.stateOfCharge;
        this.totalDurationSecs = transaction.stop.totalDurationSecs;
        this.totalInactivitySecs = transaction.stop.totalInactivitySecs;
        this.isStoppedByAnotherUser = (transaction.user && transaction.user.id !== transaction.stop.user.id);
      } else {
        this.totalConsumption = transaction.currentTotalConsumption;
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
