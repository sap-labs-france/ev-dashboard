import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfigService } from 'app/services/config.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Connector } from 'app/types/ChargingStation';
import { Image } from 'app/types/GlobalType';
import { Transaction } from 'app/types/Transaction';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { LocaleService } from '../../../services/locale.service';
import { MessageService } from '../../../services/message.service';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { ConsumptionChartComponent } from '../../component/consumption-chart/consumption-chart.component';
import { AppPercentPipe } from '../../formatters/app-percent-pipe';

@Component({
  templateUrl: './transaction-dialog.component.html',
})
export class TransactionDialogComponent implements OnInit, OnDestroy {
  public transaction!: Transaction;
  public connector!: Connector;
  public chargingStationId!: string;
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

  @ViewChild('chartConsumption', { static: false }) chartComponent!: ConsumptionChartComponent;
  private transactionId!: number;

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
    private localeService: LocaleService,
    protected dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.localeService.getCurrentLocaleSubject().subscribe((locale) => {
      this.locale = locale.currentLocaleJS;
    });
    if (data) {
      this.transactionId = data.transactionId;
      this.connector = data.connector;
      this.chargingStationId = data.chargingStationId;
    }
    // listen to keystroke
    this.dialogRef.keydownEvents().subscribe((keydownEvents) => {
      // check if escape
      if (keydownEvents && keydownEvents.code === 'Escape') {
        this.dialogRef.close();
      }
    });
  }

  ngOnInit(): void {
    // Handle Poll (config service available only in component not possible in data-source)
    this.autoRefeshPollEnabled = this.configService.getCentralSystemServer().pollEnabled;
    this.autoRefeshPollingIntervalMillis = this.configService.getCentralSystemServer().pollIntervalSecs * 1000;
    // Load
    this.loadData();
  }

  ngOnDestroy(): void {
    // Destroy
    this.destroyAutoRefreshTimer();
  }

  createAutoRefreshTimer() {
    // Create timer only if socketio is not active
    if (this.autoRefeshPollEnabled && !this.autoRefeshTimer) {
      if (this.autoRefeshPollEnabled) {
        // Create timer
        this.autoRefeshTimer = setInterval(() => {
          // Reload
          this.refresh();
        }, this.autoRefeshPollingIntervalMillis);
      } else {
        this.refreshSubscription = this.centralServerNotificationService.getSubjectTransaction().pipe(debounceTime(
          this.configService.getAdvanced().debounceTimeNotifMillis)).subscribe((singleChangeNotification) => {
          // Update user?
          if (singleChangeNotification && singleChangeNotification.data && singleChangeNotification.data.id === this.transactionId.toString()) {
            this.refresh();
          }
        });
      }
    }
  }

  destroyAutoRefreshTimer() {
    // Clean up
    if (this.autoRefeshTimer) {
      clearInterval(this.autoRefeshTimer);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refresh() {
    this.loadData();
    this.chartComponent.refresh();
  }

  loadData() {
    this.spinnerService.show();
    if (!this.transactionId) {
      this.centralServerService.getLastTransaction(this.chargingStationId,
        this.connector.connectorId.toString()).subscribe((dataResult) => {
        if (dataResult.result && dataResult.result.length > 0) {
          this.transactionId = dataResult.result[0].id;
          this.loadConsumption(this.transactionId);
        } else {
          this.spinnerService.hide();
          this.messageService.showInfoMessage('chargers.no_transaction_found', { chargerID: this.chargingStationId });
          this.dialogRef.close();
        }
      });
    } else {
      this.loadConsumption(this.transactionId);
    }
  }

  loadConsumption(transactionId: number) {
    this.spinnerService.show();
    this.centralServerService.getConsumptionFromTransaction(this.transactionId).subscribe((transaction: Transaction) => {
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
