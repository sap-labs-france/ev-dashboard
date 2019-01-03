import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Constants} from '../../../utils/Constants';
import {Connector, Image, SiteArea, Transaction} from '../../../common.types';
import {LocaleService} from '../../../services/locale.service';

@Component({
  templateUrl: './session.dialog.component.html',
  styleUrls: ['./session.dialog.component.scss'],
})
export class SessionDialogComponent implements OnInit {
  public transaction: Transaction = undefined;
  public stateOfChargeIcon: string;
  public stateOfCharge: number;
  public loggedUserImage = Constants.USER_NO_PICTURE;
  private transactionId: number;
  private siteArea: SiteArea;
  private connector: Connector;

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
      this.siteArea = data.siteArea;
      this.connector = data.connector;
    }
  }

  ngOnInit(): void {
    this.centralServerService.getChargingStationConsumptionFromTransaction(this.transactionId).subscribe((transaction: Transaction) => {
      this.transaction = transaction;
      if (transaction.hasOwnProperty('stateOfCharge')) {
        this.stateOfCharge = transaction.stop ? transaction.stop.stateOfCharge : transaction.currentStateOfCharge;
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
