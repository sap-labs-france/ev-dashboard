
import { Component, Inject, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CentralServerService } from '../../../services/central-server.service';
import { Constants } from '../../../utils/Constants';
import { Image, Transaction } from '../../../common.types';
import { ConsumptionChartComponent } from '../../component/transaction-chart/consumption-chart.component';
import { PercentPipe } from '@angular/common';
import { ConfigService } from 'app/services/config.service';
import { SpinnerService } from 'app/services/spinner.service';

@Component({
  templateUrl: './session.dialog.component.html'
})
export class SessionDialogComponent implements OnInit, OnDestroy {
  public transaction: Transaction = undefined;
  public stateOfChargeIcon: string;
  public stateOfCharge: number;
  public endStateOfCharge: number;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  public totalConsumption: number;
  private transactionId: number;
  public totalInactivitySecs: number;
  public totalDurationSecs: number;
  public percentOfInactivity: string;


  private autoRefeshTimer;
  private autoRefeshPollEnabled;
  private autoRefeshPollingIntervalMillis = Constants.DEFAULT_POLLING_MILLIS;

  @ViewChild('chartConsumption') chartComponent: ConsumptionChartComponent;

  constructor(
      private spinnerService: SpinnerService,
      private percentPipe: PercentPipe,
      private centralServerService: CentralServerService,
      private configService: ConfigService,
      protected dialogRef: MatDialogRef<SessionDialogComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.transactionId = data.transactionId;
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
      // Create timer
      this.autoRefeshTimer = setInterval(() => {
        // Reload
        this.refresh();
      }, this.autoRefeshPollingIntervalMillis);
    }
  }

  destroyAutoRefreshTimer() {
    // Clean up
    if (this.autoRefeshTimer) {
      clearInterval(this.autoRefeshTimer);
    }
  }

  refresh() {
    this.loadData();
    this.chartComponent.refresh();
  }

  loadData() {
    this.spinnerService.show();
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId).subscribe((transaction: Transaction) => {
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
      } else {
        this.totalConsumption = transaction.currentTotalConsumption;
        this.stateOfCharge = transaction.stateOfCharge;
        this.endStateOfCharge = transaction.currentStateOfCharge;
        this.totalDurationSecs = transaction.currentTotalDurationSecs;
        this.totalInactivitySecs = transaction.currentTotalInactivitySecs;
      }
      this.percentOfInactivity =
        ` (${this.percentPipe.transform(this.totalDurationSecs > 0 ? this.totalInactivitySecs / this.totalDurationSecs : 0, '1.0-0')})`;
      if (transaction.hasOwnProperty('stateOfCharge')) {
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

      this.centralServerService.getUserImage(transaction.user.id).subscribe((userImage: Image) => {
        if (userImage && userImage.image) {
          this.loggedUserImage = userImage.image.toString();
        }
      });
    });
  }
}
