import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Constants} from '../../../utils/Constants';
import {Connector, Image, SiteArea, Transaction} from '../../../common.types';
import {LocaleService} from '../../../services/locale.service';
import {ConsumptionChartComponent} from '../../component/transactionChart/consumption-chart.component';

@Component({
  templateUrl: './session.dialog.component.html',
  styleUrls: ['./session.dialog.component.scss'],
})
export class SessionDialogComponent implements OnInit {
  public transaction: Transaction = undefined;
  public stateOfChargeIcon: string;
  public stateOfCharge: number;
  public endStateOfCharge: number;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  private transactionId: number;
  private totalConsumption: number;
  private totalInactivitySecs: number;
  private totalDurationSecs: number;

  @ViewChild('chartConsumption') chartComponent: ConsumptionChartComponent;

  constructor(
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private router: Router,
    protected dialogRef: MatDialogRef<SessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    if (data) {
      this.transactionId = data.transactionId;
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  refresh() {
    this.loadData();
    this.chartComponent.refresh();
  }

  loadData() {
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId).subscribe((transaction: Transaction) => {
      this.transaction = transaction;
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
